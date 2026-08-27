const {
  getTasks,
  getExams,
} = require("./db/queries");

const {
  generateStudyPlan,
} = require("./services/planner");

async function testPlanner() {
  try {
    const tasks = await getTasks();
    const exams = await getExams();

    const availableHours = 1;

    const plan = generateStudyPlan(
      tasks,
      exams,
      availableHours
    );

    console.log(
      "Tasks from PostgreSQL:"
    );

    console.table(tasks);

    console.log(
      "\nExams from PostgreSQL:"
    );

    console.table(exams);

    console.log(
      `\nGenerated Adaptive Study Plan (${availableHours} hour):`
    );

    console.table(plan);
  } catch (error) {
    console.error(
      "Planner test failed:"
    );

    console.error(error.message);
  }
}

testPlanner();