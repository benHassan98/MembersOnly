import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Header from "../components/Header";
import { CookiesProvider } from "react-cookie";
import { UserContext } from "../components/UserContext";
import { BrowserRouter } from "react-router-dom";

let user, setUser;
const mockedRemvoeCookie = jest.fn();
jest.mock("react-cookie", () => ({
  ...jest.requireActual("react-cookie"),
  useCookies: () => [{}, {}, mockedRemvoeCookie],
}));
let mockedUseNavigate;
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockedUseNavigate,
}));


describe("Header", () => {
  beforeEach(() => {
    fetch.resetMocks();
    user = { userName: null, isAdmin: false, isMember: false };
    setUser = jest.fn();
    mockedUseNavigate = jest.fn();
  });

  test("Header renders successfully", () => {
    render(
      <BrowserRouter>
        <CookiesProvider>
          <UserContext.Provider value={{ user, setUser }}>
            <Header />
          </UserContext.Provider>
        </CookiesProvider>
      </BrowserRouter>
    );
    const linkCnt = screen.getAllByRole("link");
    const home = screen.getByRole("link", { name: "Home" });
    const logIn = screen.getByRole("link", { name: "Log in" });
    const signUp = screen.getByRole("link", { name: "Sign up" });

    expect(linkCnt.length).toBe(4);
    expect(home).toBeDefined();
    expect(logIn).toBeDefined();
    expect(signUp).toBeDefined();
  });
  test("renders home,logOut,becomeAdmin,joinClubHouse,CreateMessage when user logIn", () => {
    user = { userName: "fake" };
    render(
      <BrowserRouter>
        <CookiesProvider>
          <UserContext.Provider value={{ user, setUser }}>
            <Header />
          </UserContext.Provider>
        </CookiesProvider>
      </BrowserRouter>
    );
    const linkCnt = screen.getAllByRole("link");
    const home = screen.getByRole("link", { name: "Home" });
    const logOut = screen.getByRole("button", { name: "Log out" });
    const becomeAdmin = screen.getByRole("link", { name: "Become Admin" });
    const joinTheClub = screen.getByRole("link", { name: "Join Clubhouse" });
    const createMessage = screen.getByRole("link", { name: "Create Message" });

    expect(linkCnt.length).toBe(5);
    expect(home).toBeDefined();
    expect(logOut).toBeDefined();
    expect(becomeAdmin).toBeDefined();
    expect(joinTheClub).toBeDefined();
    expect(createMessage).toBeDefined();
  });

  test("renders home,logOut,joinClubHouse,createMessage when user is admin", () => {
    user = { userName: "fake", isAdmin: true };
    render(
      <BrowserRouter>
        <CookiesProvider>
          <UserContext.Provider value={{ user, setUser }}>
            <Header />
          </UserContext.Provider>
        </CookiesProvider>
      </BrowserRouter>
    );
    const linkCnt = screen.getAllByRole("link");
    const home = screen.getByRole("link", { name: "Home" });
    const logOut = screen.getByRole("button", { name: "Log out" });
    const joinTheClub = screen.getByRole("link", { name: "Join Clubhouse" });
    const createMessage = screen.getByRole("link", { name: "Create Message" });

    expect(linkCnt.length).toBe(4);
    expect(home).toBeDefined();
    expect(logOut).toBeDefined();
    expect(joinTheClub).toBeDefined();
    expect(createMessage).toBeDefined();
  });
  test("renders home,logOut,createMessage when user is admin and member", () => {
    user = { userName: "fake", isAdmin: true, isMember: true };
    render(
      <BrowserRouter>
        <CookiesProvider>
          <UserContext.Provider value={{ user, setUser }}>
            <Header />
          </UserContext.Provider>
        </CookiesProvider>
      </BrowserRouter>
    );
    const linkCnt = screen.getAllByRole("link");
    const home = screen.getByRole("link", { name: "Home" });
    const logOut = screen.getByRole("button", { name: "Log out" });
    const createMessage = screen.getByRole("link", { name: "Create Message" });

    expect(linkCnt.length).toBe(3);
    expect(home).toBeDefined();
    expect(logOut).toBeDefined();
    expect(createMessage).toBeDefined();
  });

  test("should logOut user", async () => {
    user = { userName: "fake", isAdmin: true, isMember: true };
    fetch.mockResponse(JSON.stringify({ message: "successfull response" }));
    render(
      <BrowserRouter>
        <CookiesProvider>
          <UserContext.Provider value={{ user, setUser }}>
            <Header />
          </UserContext.Provider>
        </CookiesProvider>
      </BrowserRouter>
    );
    const userMock = userEvent.setup();
    await userMock.click(screen.getByRole("button", { name: "Log out" }));

    expect(mockedRemvoeCookie).toHaveBeenCalledTimes(1);
    expect(mockedUseNavigate).toHaveBeenCalledTimes(1);
    expect(setUser).toHaveBeenCalledTimes(1);
    
  });
});
