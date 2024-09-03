import dotenv from "dotenv";

dotenv.config();

export const repositoryPath = process.env.REPOSITORY_PATH;
export const gitUsername = process.env.GIT_USER_NAME;
export const gitEmail = process.env.GIT_EMAIL;
