require "./sudoku"
require "test/unit"
require "csv"

class TestSudoku < Test::Unit::TestCase
  def test_solve_once
    quiz = [
      [0, 0, 4, 3, 0, 0, 2, 0, 9],
      [0, 0, 5, 0, 0, 9, 0, 0, 1],
      [0, 7, 0, 0, 6, 0, 0, 4, 3],
      [0, 0, 6, 0, 0, 2, 0, 8, 7],
      [1, 9, 0, 0, 0, 7, 4, 0, 0],
      [0, 5, 0, 0, 8, 3, 0, 0, 0],
      [6, 0, 0, 0, 0, 0, 1, 0, 5],
      [0, 0, 3, 5, 0, 8, 6, 9, 0],
      [0, 4, 2, 9, 1, 0, 3, 0, 0],
    ].flatten
    solution = [
      [8, 6, 4, 3, 7, 1, 2, 5, 9],
      [3, 2, 5, 8, 4, 9, 7, 6, 1],
      [9, 7, 1, 2, 6, 5, 8, 4, 3],
      [4, 3, 6, 1, 9, 2, 5, 8, 7],
      [1, 9, 8, 6, 5, 7, 4, 3, 2],
      [2, 5, 7, 4, 8, 3, 9, 1, 6],
      [6, 8, 9, 7, 3, 4, 1, 2, 5],
      [7, 1, 3, 5, 2, 8, 6, 9, 4],
      [5, 4, 2, 9, 1, 6, 3, 7, 8],
    ].flatten
    sudoku = Sudoku.new(quiz)
    assert_equal(true, sudoku.solve, "unsolved")
    assert_equal(solution, sudoku.table, "mismatch")
  end

  def test_solve_1000times
    def encode(str)
      str.chars.map(&:to_i)
    end

    CSV.foreach("sudoku.csv", {:headers => true}).with_index(1) do |csv_row, idx|
      break if idx > 1000
      sudoku = Sudoku.new(encode(csv_row["quizzes"]))
      assert_equal(true, sudoku.solve, "unsolved")
      assert_equal(encode(csv_row["solutions"]), sudoku.table, "mismatch")
    end
  end
end
