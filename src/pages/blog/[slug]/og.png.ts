import type { APIRoute } from 'astro';
import type { CollectionEntry } from 'astro:content';
import { buildOG } from '../../../og';
import { getPublishedPosts } from '../../../utils/blog';

export async function getStaticPaths() {
  return (await getPublishedPosts()).map((post) => ({
    params: { slug: post.id }, props: { post },
  }));
}

export const GET: APIRoute = async ({ props }) => {
  const post = props.post as CollectionEntry<'blog'>;
  const buffer = buildOG(post.data.title, post.data.date);
  return new Response(new Uint8Array(buffer), {
    headers: { 'Content-Type': 'image/png' },
  });
};
