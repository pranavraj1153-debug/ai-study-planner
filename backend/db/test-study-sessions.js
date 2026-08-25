const {
  createStudySession,
  getStudySessions,
  getTaskById,
} = require("./queries");

async function testStudySessions() {
  try {
    // Use the Data Structures task.
    const taskId = 1;

    console.log("Before session:");

    const beforeTask =
      await getTaskById(taskId);

    console.log(beforeTask);

    // Record 30 minutes.
    const session =
      await createStudySession({
        taskId,
        minutes: 30,
      });

    console.log("\nCreated study session:");
    console.log(session);

    // Check task progress.
    const afterTask =
      await getTaskById(taskId);

    console.log(
      "\nTask after study session:"
    );

    console.log(afterTask);

    // Get session history.
    const sessions =
      await getStudySessions();

    console.log(
      "\nStudy session history:"
    );

    console.table(sessions);
  } catch (error) {
    console.error(
      "\nStudy session test failed:"
    );

    console.error(error.message);
  }
}

testStudySessions();