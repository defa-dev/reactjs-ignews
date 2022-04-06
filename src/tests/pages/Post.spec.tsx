import { render, screen } from "@testing-library/react";
import { getSession } from "next-auth/react";
import { mocked } from "ts-jest/utils";

import { getPrismicClient } from "../../services/prismic";
import { stripe } from "../../services/stripe";

import Post, { getServerSideProps } from "../../pages/posts/[slug]";

const post = {
  slug: "my-new-post",
  title: "My new post",
  content: "<p>Post exerpt</p>",
  updatedAt: "06 de Abril",
};

jest.mock("next-auth/react");
jest.mock("../../services/prismic");

describe("Post page", () => {
  it("renders correctly", () => {
    render(<Post post={post} />);

    expect(screen.getByText("My new post")).toBeInTheDocument();
    expect(screen.getByText("Post exerpt")).toBeInTheDocument();
  });

  it("redirects when thre is no subscription", async () => {
    const mockedGetSession = mocked(getSession);

    mockedGetSession.mockResolvedValueOnce(null);

    const response = await getServerSideProps({
      params: { slug: "my-new-post" },
    } as any);

    expect(response).toEqual(
      expect.objectContaining({
        redirect: expect.objectContaining({
          destination: "/",
        }),
      })
    );
  });

  it("loads initial data", async () => {
    const mockedGetPrismicClient = mocked(getPrismicClient);
    const mockedGetSession = mocked(getSession);

    mockedGetSession.mockResolvedValueOnce({
      activeSubscription: "fake-active-subscription",
    } as any);

    mockedGetPrismicClient.mockReturnValueOnce({
      getByUID: jest.fn().mockResolvedValueOnce({
        data: {
          title: [
            {
              type: "heading",
              text: "My new post",
            },
          ],
          content: [
            {
              type: "paragraph",
              text: "Post content",
            },
          ],
        },
        last_publication_date: "04-01-2022",
      }),
    } as any);

    const response = await getServerSideProps({
      params: { slug: "my-new-post" },
    } as any);

    expect(response).toEqual(
      expect.objectContaining({
        props: {
          post: 
            {
              slug: "my-new-post",
              title: "My new post",
              content: "<p>Post content</p>",
              updatedAt: "01 de abril de 2022",
            },
        },
      })
    );
  });
});
