import { getCollection } from 'astro:content';

export async function getPublishedPosts() {
	return (await getCollection('blog', ({ data }) => !data.draft)).sort(
		(a, b) => b.data.date.valueOf() - a.data.date.valueOf(),
	);
}

export function formatDate(date: Date) {
	return date.toLocaleDateString('en-GB', {
		day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC',
	});
}
