using System;
using SecurityLab1.Enum;
using SecurityLab1.Interfaces;
using SecurityLab1.TaskSolvers;

namespace SecurityLab1.Factories
{
    public class TaskFactory
    {
        public ITaskSolver GetTaskSolver(TasksEnum task)
        {
            return task switch
            {
                TasksEnum.BinaryBase64 => new BinaryBase64Solver(),
                TasksEnum.XorCipher => new XorCipherSolver(),
                TasksEnum.RepeatingXorCipher => new RepeatingXorCipherSolver(),
                _ => throw new ArgumentException("No such task.")
            };
        }
    }
}