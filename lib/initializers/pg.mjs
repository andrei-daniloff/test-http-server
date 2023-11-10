import postgres from 'postgres';
import pMap from 'p-map';

const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const largeContent = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.';

const sql = postgres({
	host: '127.0.0.1',
	port: 9432,
	user: 'frmwrk',
	password: 'frmwrk',
	database: 'frmwrk',
});

if (process.env.CREATE_POSTS) {
	await pMap(Array.from({ length: 100_000 }), async (_, index) => {
		const slug = `my_super_puper_slug_${index}`;
		const title = `${largeContent} (${index})`;
		const description = generateRandomFieldValue();
		const attributes = generateRandomJson(1);

		await sql`INSERT INTO post (slug, title, description, attributes) VALUES (${slug}, ${title}, ${description}, ${attributes})`;
	}, { concurrency: 10 })

	function generateRandomJson(n) {
		const json = {};

		for (let i = 0; i < 5; i++) {
			const fieldName = generateRandomFieldName();
			const fieldValue = generateRandomFieldValue(n);

			json[fieldName] = fieldValue;
		}

		return json;
	}

	function generateRandomFieldName() {
		let fieldName = '';

		for (let i = 0; i < 10; i++) {
			const randomIndex = Math.floor(Math.random() * alphabet.length);
			fieldName += alphabet.charAt(randomIndex);
		}

		return fieldName;
	}

	function generateRandomFieldValue(n = 200) {
		let fieldValue = '';

		for (let i = 0; i < n; i++) {
			fieldValue += largeContent;
		}

		return fieldValue;
	}
}

export default sql;
