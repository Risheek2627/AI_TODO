const Task = require("../model/Task");
// const { ChartJSNodeCanvas } = require("chartjs-node-canvas");
// const fs = require("fs");
// const path = require("path");

// Create charts folder if not exists
// const chartDir = path.join(__dirname, "..", "charts");
// if (!fs.existsSync(chartDir)) {
//   fs.mkdirSync(chartDir, { recursive: true });
// }

// const width = 600;
// const height = 400;
// const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });

// async function generateBarChart({ totalTasks, completedTasks, pendingTasks }) {
//   const config = {
//     type: "bar",
//     data: {
//       labels: ["Completed", "Pending"],
//       datasets: [
//         {
//           label: "Tasks",
//           data: [completedTasks, pendingTasks],
//           backgroundColor: ["#4CAF50", "#F44336"],
//         },
//       ],
//     },
//   };

//   const imageBuffer = await chartJSNodeCanvas.renderToBuffer(config);

//   const imagePath = path.join(
//     __dirname,
//     "..",
//     "charts",
//     "daily-progress-bar.png"
//   );
//   fs.writeFileSync(imagePath, imageBuffer);
// }

const isValidWeek = (start, end) => {
  const diff = new Date(end) - new Date(start);
  const days = diff / (1000 * 60 * 60 * 24);
  return days === 6;
};

// console.log(isValidWeek("2025-07-20", "2025-07-14"));

getWeeklyProgress = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const userId = req.user.id;
    let start, end;

    if (startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);

      if (!isValidWeek(start, end)) {
        return res
          .status(400)
          .json({ error: "Custom week must be exactly 7 days long." });
      }

      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    } else {
      const today = new Date(); // 2025 - 07 - 26
      console.log(today);
      const day = today.getDay(); // as saturday is 26th  so we get 6
      const diffToMonday = day === 0 ? -6 : 1 - day; // as 26 is saturday we get 26  means (6)  as days or calculated with number 0 -mon , 1 - tue like that so we got 6  and  it doest match first conditin as day = 0  so to do subtract  wih 1 - day we get -5  , 6 -5 = 1 we get monday

      start = new Date(today);
      start.setDate(today.getDate() + diffToMonday); // 26 + (-5) => 21(monday)
      start.setHours(0, 0, 0, 0);

      end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
    }

    const tasks = await Task.find({
      user: userId,
      createdAt: { $gte: start, $lte: end },
    });
    // console.log(start, end);
    const total = tasks.length;

    const completed = tasks.filter((task) => task.completed === true).length;
    const pending = total - completed;
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

    return res.json({
      week: {
        from: start.toDateString(),
        to: end.toDateString(),
        custom: !!startDate && !!endDate,
      },
      totalTasks: total,
      completedTasks: completed,
      pendingTasks: total - completed,
      completionRate: `${percent}%`,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

const dailyProgress = async (req, res) => {
  try {
    const { date } = req.query;
    if (date && isNaN(Date.parse(date))) {
      return res.status(400).json({ error: "Invalid date format." });
    }
    let start, end;
    if (date) {
      start = new Date(date);
      start.setHours(0, 0, 0, 0);

      end = new Date(start);
      end.setHours(23, 59, 59, 999);
    } else {
      start = new Date();
      start.setHours(0, 0, 0, 0);

      end = new Date(start);
      end.setHours(23, 59, 59, 999);
    }
    console.log(req.user.id);

    const tasks = await Task.find({
      user: req.user.id,
      createdAt: { $gte: start, $lte: end },
    });

    // console.log(tasks);
    const total = tasks.length;

    const completed = tasks.filter((task) => task.completed === true).length;
    const pending = total - completed;
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

    // todo   Chart generate for data
    // try {
    //   await generateBarChart({
    //     completedTasks: completed,
    //     pendingTasks: pending,
    //   });
    // } catch (err) {
    //   console.error("Chart generation failed:", err);
    // }

    return res.json({
      todayTime: start.toDateString(),
      totalTasks: total,
      completedTasks: completed,
      pendingTasks: pending,
      completetionRate: percent,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { getWeeklyProgress, dailyProgress };
