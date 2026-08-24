const {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
} = require("./queries");

async function testTaskCrud() {
  let createdTask;

  try {
    // 1. Create
    createdTask = await createTask({
      subject: "Operating Systems",
      time: "5:00 - 6:00",
      estimatedMinutes: 60,
      completedMinutes: 0,
      difficulty: "medium",
      priority: "medium",
    });

    console.log("\nCreated task:");
    console.log(createdTask);

    // 2. Read
    const tasks = await getTasks();

    console.log("\nAll tasks:");
    console.table(tasks);

    // 3. Update progress
    const updatedTask = await updateTask(
      createdTask.id,
      {
        completedMinutes: 30,
      }
    );

    console.log("\nUpdated task:");
    console.log(updatedTask);

    // 4. Delete
    const deleted = await deleteTask(
      createdTask.id
    );

    console.log(
      "\nTask deleted:",
      deleted
    );
  } catch (error) {
    console.error(
      "\nTask CRUD test failed:"
    );

    console.error(error.message);
  }
}

testTaskCrud();