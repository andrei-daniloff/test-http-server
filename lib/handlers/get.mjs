import sql from "../initializers/pg.mjs";

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default async function get(req, res) {
	const userId = getRandomInt(1, 800_000);

	const [user] = await sql`SELECT * FROM "user" WHERE sid = 101010 LIMIT 1`;

	if (user === undefined) {
		throw new Error('!user');
	}

	const [acl] = await sql`SELECT * FROM acl WHERE role = 'reader' LIMIT 1`;

	if (acl === undefined) {
		throw new Error('!acl');
	}

	const [post] = await sql`SELECT slug, title, description, attributes FROM post WHERE slug = ${req.params.slug} LIMIT 1`;

	if (post === undefined) {
		throw new Error('!post');
	}

	const dto = {
		...post,
		attributes: JSON.parse(post.attributes),
	};

	if (res.json === undefined) {
		return dto;
	} else {
		res.json(dto);
	}
}
