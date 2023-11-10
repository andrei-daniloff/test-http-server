package main

import (
	"database/sql"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
)

var db *sql.DB

func main() {
	gin.DisableConsoleColor()
	gin.SetMode("release")

	var err error
	db, err = sql.Open("postgres", "postgres://frmwrk:frmwrk@127.0.0.1:9432/frmwrk?sslmode=disable")
	if err != nil {
		log.Fatal(err)
	}

	db.SetMaxOpenConns(10)
	db.SetConnMaxLifetime(60 * time.Second)

	router := gin.New()

	router.GET("/", findHandler)
	router.GET("/:slug", getHandler)

	// ticker := time.NewTicker(1 * time.Second)
	// quit := make(chan struct{})
	// go func() {
	// 	for {
	// 		select {
	// 		case <-ticker.C:
	// 			stat, err := linuxproc.ReadStat("/proc/stat")
	// 			if err != nil {
	// 				log.Fatal("stat read fail")
	// 			}

	// 			for _, s := range stat.CPUStats {
	// 				fmt.Println(s)
	// 			}
	// 		case <-quit:
	// 			ticker.Stop()
	// 			return
	// 		}
	// 	}
	// }()

	router.Run("localhost:3000")
}

func getRandomInt(min, max int) int {
	return rand.Intn(max-min) + min
}

type User struct {
	Sid   int
	Login string
}

type Acl struct {
	Role        string
	Permissions string
	Sid         int
}

type Post struct {
	Sid         int    `json:"sid"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Slug        string `json:"slug"`
	Attributes  []byte `json:"attributes"`
}

type GetHandlerParameters struct {
	Slug string `uri:"slug" binding:"required"`
}

func findHandler(c *gin.Context) {
	userId := getRandomInt(1, 800_000)

	rows, err := db.Query("SELECT sid, login FROM \"user\" WHERE sid = $1 LIMIT 1", userId)

	if err != nil {
		fmt.Println(err)
		return
	}

	for rows.Next() {
		var user User

		if err := rows.Scan(&user.Sid, &user.Login); err != nil {
			fmt.Println(err)
			return
		}
	}

	rows, err = db.Query("SELECT sid, role, permissions FROM \"acl\" WHERE role = 'reader' LIMIT 1")

	if err != nil {
		fmt.Println(err)
		return
	}

	for rows.Next() {
		var acl Acl

		if err := rows.Scan(&acl.Sid, &acl.Role, &acl.Permissions); err != nil {
			fmt.Println(err)
			return
		}
	}

	wg := sync.WaitGroup{}
	wg.Add(2)

	total := 0
	posts := []Post{}

	go func() {
		defer wg.Done()

		err = db.QueryRow(`SELECT count(*)::int as count FROM post`).Scan(&total)

		if err != nil {
			log.Fatal(err)
		}
	}()

	go func() {
		defer wg.Done()

		rows, err = db.Query(`SELECT sid, slug, title, description, attributes FROM post LIMIT 100`)

		if err != nil {
			fmt.Println(err)
			return
		}

		for rows.Next() {
			post := Post{}

			if err := rows.Scan(&post.Sid, &post.Slug, &post.Title, &post.Description, &post.Attributes); err != nil {
				fmt.Println(err)
				return
			}

			posts = append(posts, post)
		}
	}()

	wg.Wait()

	c.JSON(http.StatusOK, gin.H{
		"total": total,
		"posts": posts,
	})
}

func getHandler(c *gin.Context) {
	var parameters GetHandlerParameters

	c.ShouldBindUri(&parameters)

	userId := getRandomInt(1, 800_000)

	rows, err := db.Query("SELECT sid, login FROM \"user\" WHERE sid = $1 LIMIT 1", userId)

	if err != nil {
		fmt.Println(err)
		return
	}

	for rows.Next() {
		var user User

		if err := rows.Scan(&user.Sid, &user.Login); err != nil {
			fmt.Println(err)
			return
		}
	}

	rows, err = db.Query("SELECT sid, role, permissions FROM \"acl\" WHERE role = 'reader' LIMIT 1")

	if err != nil {
		fmt.Println(err)
		return
	}

	for rows.Next() {
		var acl Acl

		if err := rows.Scan(&acl.Sid, &acl.Role, &acl.Permissions); err != nil {
			fmt.Println(err)
			return
		}
	}

	rows, err = db.Query("SELECT sid, slug, title, description, attributes FROM post WHERE slug = $1 LIMIT 1", parameters.Slug)

	if err != nil {
		fmt.Println(err)
		return
	}

	posts := []Post{}

	for rows.Next() {
		post := Post{}

		if err := rows.Scan(&post.Sid, &post.Slug, &post.Title, &post.Description, &post.Attributes); err != nil {
			fmt.Println(err)
			return
		}

		posts = append(posts, post)
	}

	if len(posts) == 0 {
		c.JSON(http.StatusNotFound, gin.H{})
		return
	}

	c.JSON(http.StatusOK, posts[0])
}
