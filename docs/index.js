filenames = ["log1.json", "log2.json", "log3.json", "special.json"]
filename = filenames[Math.floor(Math.random() * filenames.length)]
fetch(filename)
  .then((response) => {
    return response.json()
  }).then((json) => {
    run(json)
  })

const run = ({ initial, final, log }) => {
  var { app, h } = hyperapp
  const n = 9, k = 3
  const BASE_INTERVAL = 800

  const state = {
    table: initial.map((row) => {
      return row.map((val) => {
        return ({ val: (val === 0 ? " " : val), textColor: "black", backgroundColor: "white", fontStyle: (val === 0 ? "italic" : "normal") })
      })
    }),
    log: log,
    totalStep: log.length,
    previousRecord: null,
    intervalID: null,
  }

  const updateCell = (pos, val, color) => {
    state.table[pos.r][pos.c].val = val
    state.table[pos.r][pos.c].backgroundColor = color
  }

  const changeRangeColor = (pos, color) => {
    for (let l = 0; l < n; l++) {
      state.table[pos.r][l].backgroundColor = color
      state.table[l][pos.c].backgroundColor = color
    }
    const rr = Math.floor(pos.r / k), cc = Math.floor(pos.c / k)
    for (let i = rr * k; i < (rr + 1) * k; i++) { // ブロック
      for (let j = cc * k; j < (cc + 1) * k; j++) {
        state.table[i][j].backgroundColor = color
      }
    }
  }

  const changeTargetCellColor = (pos, val, color) => {
    for (let l = 0; l < n; l++) { // 行と列
      if (state.table[pos.r][l].val === val) {
        state.table[pos.r][l].backgroundColor = color
      }
      if (state.table[l][pos.c].val === val) {
        state.table[l][pos.c].backgroundColor = color
      }
    }
    const rr = Math.floor(pos.r / k), cc = Math.floor(pos.c / k)
    for (let i = rr * k; i < (rr + 1) * k; i++) { // ブロック
      for (let j = cc * k; j < (cc + 1) * k; j++) {
        if (state.table[i][j].val === val) {
          state.table[i][j].backgroundColor = color
        }
      }
    }
  }

  const actions = {
    changeInterval: (ev) => {
      const r = parseInt(ev.target.value.replace("x", ""), 10)
      return ((state, actions) => {
        actions.set(BASE_INTERVAL / r)
      })
    },
    set: (interval) => {
      return ((state, actions) => {
        if (state.intervalID !== null) {
          clearInterval(state.intervalID)
        }
        const intervalID = setInterval(actions.draw, interval)
        return ({ intervalID })
      })
    },
    draw: () => {
      return ((state) => {
        if (state.log.length > 0) {
          const { pos, val, info } = state.log[0]
          if (state.previousRecord === null) {
            changeRangeColor(pos, "lightgray")
            changeTargetCellColor(pos, val, "lightcoral")
            updateCell(pos, val, "lightblue") // 最後に呼ぶ
          } else {
            const prevPos = state.previousRecord.pos
            const prevInfo = state.previousRecord.info
            if (prevInfo === "rollback" || prevInfo === "allowed") {
              changeRangeColor(prevPos, "white")
              if (prevInfo === "rollback") {
                updateCell(prevPos, " ", "white")
              }
            }
            switch (info) {
              case "confirming":
                if (prevInfo === "denied") {
                  changeTargetCellColor(pos, val, "lightgray")
                }
                changeRangeColor(pos, "lightgray")
                changeTargetCellColor(pos, val, "lightcoral")
                updateCell(pos, val, "lightblue")
                break
              case "allowed":
                changeRangeColor(pos, "lightblue")
                updateCell(pos, val, "lightskyblue")
                break
              case "denied":
                break
              case "rollback":
                changeRangeColor(pos, "lightcoral")
                updateCell(pos, n, "coral")
                break
              case "solved":
                changeRangeColor(prevPos, "white")
                break
            }
          }
          return ({ table: state.table, log: state.log.slice(1), previousRecord: state.log[0] })
        }
      })
    },
  }

  const Table = ({ state, actions }) => {
    return h("div", { class: "flex-container" }, [
      h("div", { class: "flex-item" },
        h("table", { oncreate: () => actions.set(BASE_INTERVAL) },
          h("tbody", {}, state.table.map((row) => {
            return h("tr", {}, row.map((cell) => {
              return h("td", { style: { color: cell.textColor, backgroundColor: cell.backgroundColor, fontStyle: cell.fontStyle } }, cell.val)
            }))
          }))
        )
      ),
      h("div", { class: "flex-item" },
        h("table", {},
          h("tbody", {}, final.map((row, i) => {
            return h("tr", {}, row.map((val, j) => {
              return h("td", { style: { color: "black", backgroundColor: "white", fontStyle: (initial[i][j] === 0 ? "italic" : "normal") } }, val)
            }))
          }))
        )
      ),
    ])
  }

  const view = (state, actions) => {
    return h("div", {}, [
      Table({ state, actions }),
      h("div", { style: { marginLeft: "0.75rem" } }, [
        h("form", {},
          h("label", { for: "speed" }, "Speed "),
          h("select", { id: "speed", name: "speed", onchange: (ev) => actions.changeInterval(ev), oncreate: (e) => e.focus() }, [1, 2, 4, 8, 16, 32].map((i) => {
            if (i === 1) {
              return h("option", { value: `x${i}`, selected: "selected" }, `x${i}`)
            } else {
              return h("option", { value: `x${i}` }, `x${i}`)
            }
          }))
        ),
        h("p", {}, `${(((state.totalStep - state.log.length) / state.totalStep) * 100).toFixed(1)} % completed`)
      ]),
    ])
  }

  const main = app(state, actions, view, document.getElementById("main"))
}