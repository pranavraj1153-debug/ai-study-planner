const {
  getDevelopmentUser,
  getTasks,
} = require("./queries");

async function testTasks() {
  try {
    const user =
      await getDevelopmentUser();

    console.log(
      "Development user:"
    );

    console.log(user);

    const tasks =
      await getTasks();

    console.log(
      "\nTasks from PostgreSQL:"
    );

    console.table(tasks);
  } catch (error) {
    console.error(
      "Task database test failed:"
    );

    console.error(error.message);
  }
}

testTasks();