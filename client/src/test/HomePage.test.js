import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import HomePage from "../components/HomePage";
import { UserContext } from "../components/UserContext";
import { BrowserRouter } from "react-router-dom";
import { act } from "react-dom/test-utils";

let user, documents;
describe("HomePage", () => {
  beforeEach(() => {
    fetch.resetMocks();
    documents = [
      {
        _id: 0,
        title: "title1",
        content: "content1",
        time_stamp: new Date().toDateString(),
        author: {
          userName: "fake1",
        },
      },
      {
        _id: 1,
        title: "title2",
        content: "content2",
        time_stamp: new Date().toDateString(),
        author: {
          userName: "fake2",
        },
      },
      {
        _id: 2,
        title: "title3",
        content: "content3",
        time_stamp: new Date().toDateString(),
        author: {
          userName: "fake3",
        },
      },
      {
        _id: 3,
        title: "title4",
        content: "content4",
        time_stamp: new Date().toDateString(),
        author: {
          userName: "fake4",
        },
      },
    ];
  });

  test("renders successfully", async () => {
    user = { userName: null, isAdmin: false, isMember: false };
    fetch.mockResponse(JSON.stringify({ documents }));

    await act(() => {
      render(
        <BrowserRouter>
          <UserContext.Provider value={{ user }}>
            <HomePage />
          </UserContext.Provider>
        </BrowserRouter>
      );
    });

    const messageCnt = screen.getAllByText(/title*/);

    expect(messageCnt.length).toBe(4);
  });

  test("displays authors and timeStamps if user is member", async () => {
    user = { userName: "fake", isMember: true };
    fetch.mockResponse(JSON.stringify({ documents }));

    await act(() => {
      render(
        <BrowserRouter>
          <UserContext.Provider value={{ user }}>
            <HomePage />
          </UserContext.Provider>
        </BrowserRouter>
      );
    });

    const messagesList = screen.getAllByText(/Author.*/);
    const timeStamps = screen.getAllByText(/Created At.*/);

    expect(messagesList[0].textContent.split(":")[1]).toBe(
      " " + documents[3].author.userName
    );
    expect(timeStamps[0].textContent.split(":")[1]).toBe(
      " " + documents[3].time_stamp
    );
  });

  test("deletes message if user is admin", async () => {
    user = { userName: "fake", isAdmin: true };
    fetch
      .once(JSON.stringify({ documents }))
      .once(JSON.stringify({ message: "successfull response" }));

    await act(() => {
      render(
        <BrowserRouter>
          <UserContext.Provider value={{ user }}>
            <HomePage />
          </UserContext.Provider>
        </BrowserRouter>
      );
    });

    const userMock = userEvent.setup();
    await userMock.click(screen.getAllByRole("button")[0]);

    const messageCnt = screen.getAllByText(/title*/);

    expect(messageCnt.length).toBe(3);
  });
});
