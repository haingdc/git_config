import { confirm } from "@inquirer/prompts";
import chalk from "chalk";
import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { gitEmail, gitUsername, repositoryPath } from "./constants.js";

const lockFilePath = path.join(repositoryPath, ".git", "index.lock");

async function checkAndRemoveLockFile() {
  return new Promise((resolve, reject) => {
    fs.access(lockFilePath, fs.constants.F_OK, async (err) => {
      if (err) {
        console.log("inspect.error", err);
        console.log(chalk.green("Wait... Ah Happy!"));
        console.log(chalk.green("git.lock is not exist. We can move on"));
        return resolve("git.lock is not exist. We can move on");
      }

      // Nếu tồn tại, bạn có thể kiểm tra xem có tiến trình nào đang sử dụng hay không
      // Ở đây, bạn có thể thêm logic kiểm tra tiến trình nếu cần thiết.
      // Ví dụ: Nếu có một tiến trình khác sử dụng Git, bạn có thể không cần xóa bản khóa.

      // Nếu không có lý do nào để giữ khóa, hỏi người dùng
      const answer = await confirm({
        message: "File git.lock exist. Do you want to remove it?",
        default: false,
      });

      if (answer) {
        fs.unlink(lockFilePath, (err) => {
          if (err) {
            reject(new Error("Error in removing git.lock file"));
          } else {
            resolve("git.lock file removed.");
          }
        });
      } else {
        reject(new Error("Canceled removing git.lock file"));
      }
    });
  });
}

async function setGitUserAndEmail(name, email) {
  return new Promise((resolve, reject) => {
    // Thiết lập tên người dùng cho repository hiện tại
    exec(
      `git config user.name "${name}"`,
      { cwd: repositoryPath },
      (error, stdout, stderr) => {
        if (error) {
          console.error(`Error setting user name: ${error.message}`);
          return reject(error);
        }
        console.log(`Set user name: ${name}`);

        // Thiết lập email cho repository hiện tại
        exec(
          `git config user.email "${email}"`,
          { cwd: repositoryPath },
          (error, stdout, stderr) => {
            if (error) {
              console.error(`Error setting user email: ${error.message}`);
              return reject(error);
            }
            console.log(`Set user email: ${email}`);
            resolve();
          }
        );
      }
    );
  });
}

try {
  await checkAndRemoveLockFile();
} catch (error) {
  console.error(error);
  if (error.message === "Canceled removing git.lock file") {
    process.exit(0);
  }
  console.log("Shut down with error", error.message);
  process.exit(1);
}

if (!gitUsername || !gitEmail) {
  console.error("Git user name or email is not set.");
  process.exit(1);
}

// Gọi hàm với tên và email
setGitUserAndEmail(gitUsername, gitEmail)
  .then(() => {
    console.log("Git user and email have been set.");
  })
  .catch((error) => {
    console.error("An error occurred:", error);
  });
