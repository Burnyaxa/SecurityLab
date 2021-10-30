using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using SecurityLab1.Enum;
using TaskFactory = SecurityLab1.Factories.TaskFactory;

namespace SecurityLab1
{
    class Program
    {
        private static readonly Dictionary<string, string> Keys = new Dictionary<string, string>()
        {
            {"--task", ""},
            {"--path", ""}
        };
        
        static async Task Main(string[] args)
        {
            foreach (var arg in args)
            {
                var keyValuePair = arg.Split("=");
                var keyPart = keyValuePair.FirstOrDefault();
                var valuePart = keyValuePair.LastOrDefault();
                if (Keys.ContainsKey(keyPart))
                {
                    Keys[keyPart] = valuePart;
                }
            }

            var taskFactory = new TaskFactory();
            var solver = taskFactory.GetTaskSolver((TasksEnum) Convert.ToInt32(Keys.FirstOrDefault().Value));
            await solver.SolveTask(Keys.LastOrDefault().Value);
        }
    }
}