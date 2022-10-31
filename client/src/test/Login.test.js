import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Login from "../components/Login";
import { BrowserRouter } from "react-router-dom";
import { CookiesProvider } from "react-cookie";
import { UserContext } from "../components/UserContext";

const mockedUseNavigate = jest.fn();
const mockedSetCookie = jest.fn();

let setUser;
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockedUseNavigate,
}));
jest.mock("react-cookie", () => ({
  ...jest.requireActual("react-cookie"),
  useCookies: () => [{}, mockedSetCookie,{}],
}));

describe("Login", () => {
  beforeEach(() => {
    fetch.resetMocks();
    setUser = jest.fn();
  });

  test("renders successfully", () => {
    render(
      <BrowserRouter>
        <CookiesProvider>
          <UserContext.Provider value={{ setUser }}>
            <Login />
          </UserContext.Provider>
        </CookiesProvider>
      </BrowserRouter>
    );

    const form = screen.getByTestId("form");
    const userName = screen.getByTestId("username");
    const password = screen.getByTestId("password");
    const loginBtn = screen.getByRole("button");

    expect(form).toBeDefined();
    expect(userName).toBeDefined();
    expect(password).toBeDefined();
    expect(loginBtn).toBeDefined();
  });

    test("should login successfully with valid credentials", async () => {
      fetch.once(JSON.stringify({ token: "fake" }),{
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },

      });
      render(
        <BrowserRouter>
          <CookiesProvider>
            <UserContext.Provider value={{ setUser }}>
              <Login />
            </UserContext.Provider>
          </CookiesProvider>
        </BrowserRouter>
      );
      const user = userEvent.setup();
      const userName = screen.getByTestId("username");
      const password = screen.getByTestId("password");
      const loginBtn = screen.getByRole("button");

      user.clear(userName);
      user.clear(password);

      await user.type(userName, "fake");
      await user.type(password, "12345");
      await user.click(loginBtn);

      expect(mockedSetCookie).toHaveBeenCalledTimes(1);
      expect(mockedUseNavigate).toHaveBeenCalledTimes(1);
      expect(setUser).toHaveBeenCalledTimes(1);
    });

    test("should show errors when submitting with missing fields", async () => {
      fetch.once(
        JSON.stringify({ message: JSON.stringify([{ param: "password" }]) }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      render(
        <BrowserRouter>
          <CookiesProvider>
            <UserContext.Provider value={{ setUser }}>
              <Login />
            </UserContext.Provider>
          </CookiesProvider>
        </BrowserRouter>
      );
      const user = userEvent.setup();
      const userName = screen.getByTestId("username");
      const password = screen.getByTestId("password");
      const loginBtn = screen.getByRole("button");

      user.clear(userName);
      user.clear(password);

      await user.type(userName, "fake");
      await user.click(loginBtn);

      expect(password.classList[password.classList.length - 1]).toBe(
        "is-invalid"
      );
    });

    test("should show errors when submitting with wrong credentials", async () => {
      fetch.once(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
        headers: {
          "Content-Type": "application/json",
        },
      });

      render(
        <BrowserRouter>
          <CookiesProvider>
            <UserContext.Provider value={{ setUser }}>
              <Login />
            </UserContext.Provider>
          </CookiesProvider>
        </BrowserRouter>
      );
      const user = userEvent.setup();
      const userName = screen.getByTestId("username");
      const password = screen.getByTestId("password");
      const passwordInvalidDiv = screen.getByTestId("invalid-feedback");
      const loginBtn = screen.getByRole("button");

      user.clear(userName);
      user.clear(password);

      await user.type(userName, "fake");
      await user.type(password, "12346");
      await user.click(loginBtn);

      expect(password.classList[password.classList.length - 1]).toBe(
        "is-invalid"
      );
      expect(passwordInvalidDiv.textContent).toBe("Wrong UserName/Password");
    });
});
