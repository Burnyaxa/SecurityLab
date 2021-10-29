using System.Threading.Tasks;

namespace SecurityLab1.Interfaces
{
    public interface ITaskSolver
    {
        Task SolveTask(string filepath);
    }
}