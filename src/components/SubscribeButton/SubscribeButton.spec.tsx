import { fireEvent, render, screen } from "@testing-library/react";
import { mocked } from "ts-jest/utils";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";

import { SubscribeButton } from ".";

jest.mock("next-auth/react");
jest.mock("next/router");

describe("SubscribeButton component", () => {
  it("redirects to posts when has subscription", () => {
    const mockedUseRouter = mocked(useRouter);
    const mockedUseSession = mocked(useSession);
    const mockPush = jest.fn();

    mockedUseSession.mockReturnValueOnce({
      data: {
        activeSubscription: "fake-subscription",
        user: {
          name: "Fulano",
          email: "fulano@dev.com",
        },
        expires: "expires-fake",
      },
      status: "authenticated",
    });

    mockedUseRouter.mockReturnValueOnce({
      push: mockPush,
    } as any);

    render(<SubscribeButton />);

    const subscribeButton = screen.getByText("Subscribe now");
    fireEvent.click(subscribeButton);

    expect(mockPush).toHaveBeenCalledWith("/posts");
  });

  it("renders correctly", () => {
    const mockedUseSession = mocked(useSession);
    render(<SubscribeButton />);

    mockedUseSession.mockReturnValueOnce({
      data: null,
      status: "unauthenticated",
    });

    expect(screen.getByText("Subscribe now")).toBeInTheDocument();
  });

  it("redirects to sig in when not authenticated", () => {
    const mockedSignIn = mocked(signIn);
    const mockedUseSession = mocked(useSession);
    render(<SubscribeButton />);

    mockedUseSession.mockReturnValueOnce({
      data: null,
      status: "unauthenticated",
    });

    const subscribeButton = screen.getByText("Subscribe now");
    fireEvent.click(subscribeButton);

    expect(mockedSignIn).toHaveBeenCalled();
  });
});
