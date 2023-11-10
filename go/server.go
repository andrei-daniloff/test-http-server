package main

import (
	"database/sql"
	"database/sql/driver"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"math"
	"math/rand"
	"net/http"
	"os"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
	"github.com/shirou/gopsutil/v3/process"
)

var db *sql.DB

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
	Attributes  Attrs  `json:"attributes"`
}

type CreatePost struct {
	Title       *string                 `json:"title"`
	Description *string                 `json:"description"`
	Slug        *string                 `json:"slug"`
	Attributes  *map[string]interface{} `json:"attributes"`
}

type GetHandlerParameters struct {
	Slug string `uri:"slug" binding:"required"`
}

type ProcessMetric struct {
	Cpu    int     `json:"cpu"`
	Memory int     `json:"memory"`
	Time   []int64 `json:"time"`
}

type Attrs map[string]interface{}

func (p Attrs) Value() (driver.Value, error) {
	j, err := json.Marshal(p)
	return j, err
}

func (p *Attrs) Scan(src interface{}) error {
	source, ok := src.([]byte)
	if !ok {
		return errors.New("Type assertion .([]byte) failed.")
	}

	var i interface{}
	err := json.Unmarshal(source, &i)
	if err != nil {
		return err
	}

	*p, ok = i.(map[string]interface{})
	if !ok {
		return errors.New("Type assertion .(map[string]interface{}) failed.")
	}

	return nil
}

var times = []int64{}

func getProcessMetrics() ProcessMetric {
	process, err := process.NewProcess(int32(os.Getpid()))

	if err != nil {
		log.Fatal(err)
	}

	cpu, err := process.CPUPercent()

	if err != nil {
		log.Fatal(err)
	}

	mem, err := process.MemoryInfo()

	if err != nil {
		log.Fatal(err)
	}

	result := ProcessMetric{
		Cpu:    int(math.Trunc(cpu)),
		Memory: int(mem.RSS),
		Time:   times,
	}

	times = []int64{}

	return result
}

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
	router.POST("/", createHandler)

	ticker := time.NewTicker(1 * time.Second)
	quit := make(chan struct{})
	go func() {
		for {
			select {
			case <-ticker.C:
				metrics := getProcessMetrics()

				f, err := os.OpenFile("./launch.json", os.O_APPEND|os.O_WRONLY|os.O_CREATE, 0600)
				if err != nil {
					panic(err)
				}

				defer f.Close()

				data, err := json.Marshal(metrics)

				if err != nil {
					panic(err)
				}

				if _, err = f.Write(data); err != nil {
					panic(err)
				}

				if _, err = f.WriteString("\n"); err != nil {
					panic(err)
				}
			case <-quit:
				ticker.Stop()
				return
			}
		}
	}()

	router.Run("localhost:3000")
}

func getRandomInt(min, max int) int {
	return rand.Intn(max-min) + min
}

func findHandler(c *gin.Context) {
	start := time.Now()

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

	times = append(times, time.Since(start).Milliseconds())
}

func getHandler(c *gin.Context) {
	start := time.Now()

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

	times = append(times, time.Since(start).Milliseconds())
}

func createHandler(c *gin.Context) {
	start := time.Now()

	body := new(CreatePost)

	if err := c.BindJSON(&body); err != nil {
		fmt.Println(err)
	}

	if body.Slug == nil || len(*body.Slug) > 1_000_000 {
		panic("Title is required")
	}

	if body.Title == nil || len(*body.Title) > 1_000_000 {
		panic("Title is required")
	}

	if body.Description == nil || len(*body.Description) > 1_000_000 {
		panic("Title is required")
	}

	if body.Attributes == nil || len(*body.Attributes) > 1_000_000 {
		panic("Title is required")
	}

	post := new(Post)

	attributes, err := json.Marshal(body.Attributes)

	if err != nil {
		fmt.Println(err)
		return
	}

	rows, err := db.Query("INSERT INTO post (slug, title, description, attributes) VALUES ($1, $2, $3, $4) RETURNING sid, slug, title, description, attributes", body.Slug, body.Title, body.Description, attributes)

	if err != nil {
		fmt.Println(err)
		return
	}

	for rows.Next() {
		if err := rows.Scan(&post.Sid, &post.Slug, &post.Title, &post.Description, &post.Attributes); err != nil {
			fmt.Println(err)
			return
		}
	}

	c.JSON(http.StatusOK, post)

	times = append(times, time.Since(start).Milliseconds())
}
