require "./sudoku"
require "test/unit"
require "csv"

class TestSudoku < Test::Unit::TestCase
  def test_solve_once
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
      quiz = csv_row["quizzes"]
      sudoku = Sudoku.new(encode(quiz))
      assert_equal(true, sudoku.solve, "unsolved")
      assert_equal(encode(csv_row["solutions"]), sudoku.table, "mismatch")
    end
  end
end
