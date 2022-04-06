import { render, screen } from "@testing-library/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { mocked } from "ts-jest/utils";

import { getPrismicClient } from "../../services/prismic";
import { stripe } from "../../services/stripe";

import Post, { getStaticProps } from "../../pages/posts/preview/[slug]";

const post = {
  slug: "my-new-post",
  title: "My new post",
  content: "<p>Post exerpt</p>",
  updatedAt: "06 de Abril",
};

jest.mock("next-auth/react");
jest.mock("next/router");
jest.mock("../../services/prismic");

describe("Post preview page", () => {
  it("renders correctly", () => {
    const mockedUseSession = mocked(useSession);
    mockedUseSession.mockReturnValueOnce({
      data: null,
      status: "unauthenticated",
    });

    render(<Post post={post} />);

    expect(screen.getByText("My new post")).toBeInTheDocument();
    expect(screen.getByText("Post exerpt")).toBeInTheDocument();
    expect(screen.getByText("Wanna continue reading?")).toBeInTheDocument();
  });

  it("redirects to full post when subscribed", async () => {
    const mockedUseSession = mocked(useSession);
    const mockedUseRouter = mocked(useRouter);
    const mockPush = jest.fn()

    mockedUseSession.mockReturnValueOnce({
      data: {
        activeSubscription: "fake-subscription",
      },
      status: "authenticated",
    } as any);
    
    mockedUseRouter.mockReturnValueOnce({
        push: mockPush
    } as any)

    render(<Post post={post} />);

    expect(mockPush).toHaveBeenCalledWith("/posts/my-new-post")
  
  });

    it("loads initial data", async () => {
      const mockedGetPrismicClient = mocked(getPrismicClient);

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

      const response = await getStaticProps({
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
