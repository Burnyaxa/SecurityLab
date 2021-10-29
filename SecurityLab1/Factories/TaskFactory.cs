using SecurityLab1.Enum;
using SecurityLab1.Interfaces;
using SecurityLab1.TaskSolvers;

namespace SecurityLab1.Factories
{
    public class TaskFactory
    {
        public ITaskSolver GetTaskSolver(TasksEnum task)
        {
            return new XorCipherSolver();
        }
    }
}