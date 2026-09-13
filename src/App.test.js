import { APP_FULL_NAME, APP_NAME } from "./config/constants";

test("Brisova branding constants", () => {
  expect(APP_NAME).toBe("Brisova");
  expect(APP_FULL_NAME).toMatch(/Brisova/i);
});
