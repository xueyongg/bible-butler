import { fallback, local_db } from '../src/fallback';
const moment = require('moment');

describe("Fallback context manipulation checks", () => {
    let mockFallback = {
        ...fallback,
        mock_set_context: jest.fn((value) => {
            return fallback.set_context("test");
        }),
        mock_clear_context: jest.fn(() => { fallback.clear_context() })
    };

    test("Should set the context into the fallback local variable when a variable is added", () => {
        mockFallback.mock_set_context("test");
        expect(mockFallback.mock_set_context).toBeCalled();
    });

    test("Should retrieve context if context is set", () => {
        expect(fallback.get_context()).toBe("test");
    });

    test("Should have context cleared when clear context is called", () => {
        mockFallback.mock_clear_context();
        expect(mockFallback.mock_clear_context).toBeCalled();
    });

    test("Should return true if context is cleared", () => {
        expect(fallback.check_context_cleared()).toBeTruthy();
    });
});

describe("DB check", () => {
    let chatDetails = {
        fromId: 12345,
        chatName: "testGroup",
        first_name: "john",
        userId: "123456",
        messageId: "1234",
    }
    let mockLocalDB = {
        ...local_db,
        mockAppend: jest.fn((chatDetails, context) => {
            return local_db.append(chatDetails, context)
        }),
        mockGet: jest.fn((password) => {
            return local_db.get(password)
        }),
        mockReload: jest.fn((dbObject) => {
            return local_db.reload(dbObject);
        })
    }

    test("Should add user into db when append", () => {
        mockLocalDB.mockAppend(chatDetails, "textContext");
        expect(mockLocalDB.mockAppend).toBeCalled();
    });
    // test("Should fail the authentication when wrong password is given", () => {
    //     expect(mockLocalDB.mockGet("aaa")).toBeUndefined();
    // });
    test("Should get the localdb", () => {
        expect(mockLocalDB.mockGet("abc")).toEqual({
            loaded: moment().format("DD-MM-YYYY HH:mm"),
            123456: {
                "first_name": "john",
                textContext: 1
            }
        })
    });
    test("Should get the db to reload and update", () => {
        mockLocalDB.mockReload(mockLocalDB.mockGet("abc"));
        expect(mockLocalDB.mockReload).toHaveBeenCalled();
    });
});