import { gql } from 'apollo-angular';

export interface GraphqlMedia {
  url: string;
  alternativeText: string | null;
}

export interface GraphqlAuthor {
  name: string;
  bio: string | null;
  avatar: GraphqlMedia | null;
}

export interface GraphqlCategory {
  name: string;
  slug: string;
}

export interface GraphqlQuoteBlock {
  __typename: 'ComponentSharedQuote';
  text: string;
  author: string | null;
}

export interface GraphqlCodeBlock {
  __typename: 'ComponentSharedCodeBlock';
  code: string;
  language: string | null;
}

export type GraphqlArticleBlock = GraphqlQuoteBlock | GraphqlCodeBlock;

export interface GraphqlArticle {
  documentId: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  publishedAt: string | null;
  cover: GraphqlMedia | null;
  author: GraphqlAuthor | null;
  categories: GraphqlCategory[];
  blocks: GraphqlArticleBlock[];
}

export interface ArticleBySlugResult {
  articles: GraphqlArticle[];
}

export const ARTICLE_BY_SLUG_QUERY = gql`
  query ArticleBySlug($slug: String!, $status: PublicationStatus) {
    articles(filters: { slug: { eq: $slug } }, status: $status) {
      documentId
      title
      excerpt
      content
      publishedAt
      cover {
        url
        alternativeText
      }
      author {
        name
        bio
        avatar {
          url
          alternativeText
        }
      }
      categories {
        name
        slug
      }
      blocks {
        __typename
        ... on ComponentSharedQuote {
          text
          author
        }
        ... on ComponentSharedCodeBlock {
          code
          language
        }
      }
    }
  }
`;
