const {
  getExams,
  createExam,
  updateExam,
  deleteExam,
} = require("./queries");

async function testExamCrud() {
  try {
    // Create
    const createdExam =
      await createExam({
        subject: "Operating Systems",
        examDate: "2026-09-15",
      });

    console.log("\nCreated exam:");
    console.log(createdExam);

    // Read
    const exams =
      await getExams();

    console.log("\nAll exams:");
    console.table(exams);

    // Update
    const updatedExam =
      await updateExam(
        createdExam.id,
        {
          examDate: "2026-09-16",
        }
      );

    console.log("\nUpdated exam:");
    console.log(updatedExam);

    // Delete
    const deleted =
      await deleteExam(
        createdExam.id
      );

    console.log(
      "\nExam deleted:",
      deleted
    );
  } catch (error) {
    console.error(
      "\nExam CRUD test failed:"
    );

    console.error(error.message);
  }
}

testExamCrud();