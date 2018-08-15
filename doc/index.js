// const init = async () => {
//   return fetch("log.json")
//     .then((response) => {
//       return response.json()
//     })
//     .then((json) => {
//       return json
//     })
// }

// init()
//   .then((res) => {
//     console.log(res)
//   })
//   .catch((err) => {
//     console.error(err)
//   })

fetch("log.json")
  .then((response) => {
    return response.json()
  }).then((json) => {
    run(json)
  })

const run = ({ initial, final, log }) => {
  var { app, h } = hyperapp
  const n = 9, k = 3
  const BASE_INTERVAL = 20

  const state = {
    table: initial.map((row) => {
      return row.map((val) => {
        return { val: val, textColor: "black", backgroundColor: "white" }
      })
    }),
  }

  const actions = {
    updateCell: ({ pos, val }) => { // accepts a single argument
      return ((state) => {
        state.table[pos[0]][pos[1]].val = val
        return ({ table: state.table }) // ???
      })
    },
    changeTargetCellColor: ({ pos, val, color }) => { // valと同じ数字のセルをcolor色にする
      return ((state) => {
        for (let l = 0; l < n; l++) { // 行と列
          if (l != pos[1] && state.table[pos[0]][l].val == val) {
            state.table[pos[0]][l].backgroundColor = color
          }
          if (l != pos[0] && state.table[l][pos[1]].val == val) {
            state.table[l][pos[1]].backgroundColor = color
          }
        }
        const m0 = Math.floor(pos[0] / k), m1 = Math.floor(pos[1] / k)
        for (let i = m0 * k; i < (m0 + 1) * k; i++) { // ブロック
          for (let j = m1 * k; j < (m1 + 1) * k; j++) {
            if (i == pos[0] && j == pos[1]) continue;
            if (state.table[i][j].val == val) state.table[i][j].backgroundColor = color
          }
        }
        return ({ table: state.table })
      })
    },
    changeBackgroundColor: ({ pos, color }) => {
      return ((state) => {
        for (let l = 0; l < n; l++) {
          state.table[pos[0]][l].backgroundColor = color.range
          state.table[l][pos[1]].backgroundColor = color.range
        }
        const m0 = Math.floor(pos[0] / k), m1 = Math.floor(pos[1] / k)
        for (let i = m0 * k; i < (m0 + 1) * k; i++) { // ブロック
          for (let j = m1 * k; j < (m1 + 1) * k; j++) {
            state.table[i][j].backgroundColor = color.range
          }
        }
        state.table[pos[0]][pos[1]].backgroundColor = color.cell
        return ({ table: state.table })
      })
    },
    // updateSpeed: (ev) => {
    //   const co = parseInt(ev.target.value.replace("x", ""), 10)
    //   return ((state) => {
    //     return ({ speed: BASE_INTERVAL / co })
    //   })
    // }
  }

  const Table = ({ state }) => {
    return h("table", { border: 1, oncreate: () => trace(state), style: { borderCollapse: "collapse" } },
      h("tbody", {}, state.table.map((row, i) => {
        return h("tr", {}, row.map((cell, j) => {
          return h("td", { style: { padding: "5px", color: cell.textColor, backgroundColor: cell.backgroundColor } }, cell.val)
        }))

      }))
    )
  }

  const view = (state, actions) => {
    return h("div", { class: "container" }, [
      Table({ state }),
      // TODO ...
      // h("p", {}, [
      //   h("form", {},
      //     h("label", { for: "speed" }, "Speed "),
      //     h("select", { id: "speed", name: "speed", onchange: (ev) => actions.updateSpeed(ev) }, [
      //       h("option", { value: "x1", selected: "selected" }, "x1"),
      //       h("option", { value: "x2" }, "x2"),
      //       h("option", { value: "x4" }, "x4"),
      //     ])
      //   )
      // ])
    ])
  }

  const main = app(state, actions, view, document.getElementById("main"))

  const sleep = (ms) => new Promise((resolve) => setTimeout(() => resolve(), ms))

  const trace = () => {
    (async () => {
      let prevPos = [-1, -1], prevInfo = "denied"
      for (let { pos, val, info } of log) {
        await sleep(BASE_INTERVAL)
        switch (info) {
          case "confirming":
            if (prevInfo == "allowed") main.changeBackgroundColor({ pos: prevPos, color: { range: "white", cell: "white" } })
            main.updateCell({ pos, val })
            main.changeBackgroundColor({ pos, color: { range: "lightgray", cell: "lightblue" } })
            main.changeTargetCellColor({ pos, val, color: "lightcoral" })
            break
          case "allowed":
            await sleep(BASE_INTERVAL * 5)
            main.changeBackgroundColor({ pos, color: { range: "lightblue", cell: "lightskyblue" } })
            await sleep(BASE_INTERVAL * 5)
            break
          case "denied":
            await sleep(BASE_INTERVAL * 5)
            main.changeTargetCellColor({ pos, val, color: "lightgray" })
            if (val == n) {
              main.changeBackgroundColor({ pos: prevPos, color: { range: "lightcoral", cell: "coral" } })
              await sleep(BASE_INTERVAL * 5)
            }
            if (prevInfo == "denied") {
              main.updateCell({ pos: prevPos, val: 0 })
              main.changeBackgroundColor({ pos: prevPos, color: { range: "white", cell: "white" } })
              main.changeBackgroundColor({ pos, color: { range: "lightgray", cell: "lightblue" } })
            }
            break
          case "solved":
            main.changeBackgroundColor({ pos: prevPos, color: { range: "white", cell: "white" } })
            break
        }
        prevInfo = info
        if (info != "solved") {
          prevPos = pos.slice()
        }
      }
    })()
  }
}