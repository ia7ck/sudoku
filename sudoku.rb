class Sudoku
  attr_accessor :table

  def initialize(table)
    @n, @k = 9, 3 # n=k^2
    @table = table
  end

  public

  def solve
    def ok(i, x) # 場所iに数字xを置けるか
      r, c = i / @n, i % @n
      return false if @table[(r * @n)...((r + 1) * @n)].include?(x) # 行
      return false if (0...@n).select { |_r| @table[_r * @n + c] == x }.size > 0 # 列
      ((r / @k * @k)...((r / @k + 1) * @k)).each do |_r|
        ((c / @k * @k)...((c / @k + 1) * @k)).each do |_c|
          return false if @table[_r * @n + _c] == x # ブロック
        end
      end
      return true
    end

    def dfs(i)
      return true if i == @n * @n
      return dfs(i + 1) if @table[i] > 0
      (1..@n).each do |x|
        if ok(i, x)
          @table[i] = x
          return true if dfs(i + 1)
          @table[i] = 0
        end
      end
      return false
    end

    return dfs(0)
  end
end
