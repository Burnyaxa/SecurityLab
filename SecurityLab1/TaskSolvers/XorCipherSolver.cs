using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using SecurityLab1.Interfaces;

namespace SecurityLab1.TaskSolvers
{
    public class XorCipherSolver : ITaskSolver
    {
        private const string Separator = "=====================================";
        public async Task SolveTask(string filepath)
        {
            var text = await File.ReadAllTextAsync(filepath);
            var hexText = ReadHexadecimalString(text);
            var results = DecipherXor(hexText);
            await using var file = new StreamWriter("result.txt", false, Encoding.UTF8);
            foreach (var result in results)
            {
                await file.WriteLineAsync(Separator);
                await file.WriteLineAsync(result);
                await file.WriteLineAsync(results.IndexOf(result).ToString());
            }
        }

        private IEnumerable<byte> ReadHexadecimalString(string str)
        {
            var result = new List<byte>();
            for (int i = 0; i < str.Length; i+= 2)
            {
                var hexValue = str.Substring(i, 2);
                result.Add(Convert.ToByte(hexValue, 16));
            }

            return result;
        }

        private List<string> DecipherXor(IEnumerable<byte> text)
        {
            var result = new List<string>();
            var currentBytes = new List<byte>();
            for (byte i = 1; i != 0; i++)
            {
                foreach (var ch in text)
                {
                    currentBytes.Add((byte)(ch ^ i));
                }

                var encodedBytes = Encoding.Convert(Encoding.Default, Encoding.UTF8, currentBytes.ToArray());
                result.Add(Encoding.UTF8.GetString(encodedBytes));
                currentBytes.Clear();
            }

            return result;
        }
    }
}