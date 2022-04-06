import { render, screen } from "@testing-library/react";
import { mocked } from "ts-jest/utils";
import { useSession } from "next-auth/react";
import { SigInButton } from ".";

jest.mock("next-auth/react");

describe("SignInButton component", () => {
  it("renders correctly when not authenticated", () => {
    const mockedUseSession = mocked(useSession);

    mockedUseSession.mockReturnValueOnce({ data: null, status: "unauthenticated" });

    render(<SigInButton />);

    expect(screen.getByText("Sign in with GitHub")).toBeInTheDocument();
  });

  it("renders correctly when authenticated", () => {
    const mockedUseSession = mocked(useSession);

    mockedUseSession.mockReturnValueOnce({ 
        data: {
            user: {
                name: 'Fulano',
                email: 'fulano@dev.com'
            },
            expires: 'expires-fake'
        }, 
        status: "authenticated" 
    })

    render(<SigInButton />);

    expect(screen.getByText("Fulano")).toBeInTheDocument();
  });
});
