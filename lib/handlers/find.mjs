import sql from "../initializers/pg.mjs";

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default async function find(req, res) {
	const userId = getRandomInt(1, 800_000);

	const [user] = await sql`SELECT * FROM "user" WHERE sid = ${userId} LIMIT 1`;

	if (user === undefined) {
		throw new Error('!user');
	}

	const [acl] = await sql`SELECT * FROM acl WHERE role = 'reader' LIMIT 1`;

	if (acl === undefined) {
		throw new Error('!acl');
	}

	const [[total], posts] = await Promise.all([
		sql`SELECT count(*)::int as count FROM post`,
		sql`SELECT slug, title, description, attributes FROM post LIMIT 100`
	]);

	const dto = {
		total: total.count,
		items: posts.map((post) => ({
			...post,
			attributes: JSON.parse(post.attributes),
		}))
	};

	if (res.json === undefined) {
		return dto;
	} else {
		res.json(dto);
	}
}
