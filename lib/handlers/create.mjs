import sql from "../initializers/pg.mjs";

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default async function create(req, res) {
	const userId = getRandomInt(1, 800_000);

	const body = req.body ?? await req.json();

	if (typeof body.slug !== 'string') {
		throw new Error('!slug');
	}

	if (typeof body.title !== 'string' || body.title.length > 500) {
		throw new Error('!title');
	}

	if (typeof body.description !== 'string' || body.description.length > 1_000_000) {
		throw new Error('!description');
	}

	if (body.attributes === undefined || body.description.length > 1_000_000) {
		throw new Error('!attributes');
	}

	const [user] = await sql`SELECT * FROM "user" WHERE sid = 101010 LIMIT 1`;

	if (user === undefined) {
		throw new Error('!user');
	}

	const [acl] = await sql`SELECT * FROM acl WHERE role = 'reader' LIMIT 1`;

	if (acl === undefined) {
		throw new Error('!acl');
	}

	const [post] = await sql`INSERT INTO post (slug, title, description, attributes) VALUES (
		${body.slug},
		${body.title},
		${body.description},
		${JSON.stringify(body.attributes)}
	) RETURNING slug, title, description, attributes`;

	if (post === undefined) {
		throw new Error('!post');
	}

	const dto = {
		...post,
		attributes: JSON.parse(post.attributes),
	};

	if (res.json === undefined) {
		if (res.send === undefined) {
			return dto;
		} else {
			res.send(dto);
		}
	} else {
		res.json(dto);
	}
}
