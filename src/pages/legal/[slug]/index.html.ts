import type { APIRoute, GetStaticPaths } from 'astro';
import { getLegalDocuments, type LegalDocument } from '../../../lib/hefesto-scaffolding';

export const getStaticPaths: GetStaticPaths = async () => {
  const docs = await getLegalDocuments();
  return docs.map((doc) => ({
    params: { slug: doc.slug },
    props: { doc },
  }));
};

export const GET: APIRoute = ({ props }) => {
  const { doc } = props as { doc: LegalDocument };
  return new Response(doc.html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
};
