const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const { protect } = require("../middleware/auth");
const User = require("../models/User");
const Transaction = require("../models/Transaction");

// ==========================================
// GLOBAL STATE
// ==========================================
if (!global.crashGame) {
  global.crashGame = {
    roundId: null,
    serverSeed: null,
    serverSeedHash: null,
    crashPoint: null,
    startTime: null,
    status: "waiting",
    players: {},
    history: [],
  };
}
if (!global.minesGames) global.minesGames = {};
if (!global.treasureGames) global.treasureGames = {};
if (!global.towerGames) global.towerGames = {};

// ==========================================
// CASINO HISTORY — Sabse pehle
// ==========================================
router.get("/history", protect, async (req, res) => {
  try {
    const transactions = await Transaction.find({
      userId: req.user._id,
      reference: {
        $regex:
          /^(DICE_|COIN_|PLINKO_|MINES_|ROULETTE_|CRASH_|TOWER_|TREASURE_)/,
      },
    }).sort({ createdAt: -1 });

    const history = transactions.map((t) => {
      let game = "Unknown";
      if (t.reference?.startsWith("DICE_")) game = "Dice";
      else if (t.reference?.startsWith("COIN_")) game = "Coin Flip";
      else if (t.reference?.startsWith("PLINKO_")) game = "Plinko";
      else if (t.reference?.startsWith("MINES_")) game = "Mines";
      else if (t.reference?.startsWith("ROULETTE_")) game = "Roulette";
      else if (t.reference?.startsWith("CRASH_")) game = "Crash";
      else if (t.reference?.startsWith("TOWER_")) game = "Tower";
      else if (t.reference?.startsWith("TREASURE_")) game = "Treasure Hunt";

      return {
        _id: t._id,
        game,
        type: t.type,
        amount: t.amount,
        status: t.status,
        note: t.note,
        createdAt: t.createdAt,
      };
    });

    res.json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==========================================
// DICE
// ==========================================
router.post("/dice", protect, async (req, res) => {
  const { betAmount, target, direction } = req.body;
  try {
    if (!betAmount || betAmount <= 0)
      return res.status(400).json({ message: "Invalid bet amount" });
    if (target < 1 || target > 99)
      return res.status(400).json({ message: "Target must be 1-99" });

    const user = await User.findById(req.user._id);
    if (user.balance < betAmount)
      return res.status(400).json({ message: "Insufficient balance" });

    user.balance -= Number(betAmount);
    const roll = Math.floor(Math.random() * 100);
    const won = direction === "under" ? roll < target : roll >= target;
    const winChance = direction === "under" ? target : 100 - target;
    const multiplier = (99 / winChance).toFixed(2);
    const payout = won ? (betAmount * multiplier).toFixed(2) : 0;

    if (won) user.balance += Number(payout);
    await user.save();

    await Transaction.create({
      userId: user._id,
      type: won ? "payout" : "bet",
      amount: Number(betAmount),
      status: "success",
      reference: "DICE_" + Date.now(),
      note: `Dice: Roll ${roll} | Target ${target} | ${won ? "Won" : "Lost"}`,
    });

    res.json({
      success: true,
      roll,
      won,
      multiplier: Number(multiplier),
      payout: Number(payout),
      newBalance: user.balance,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==========================================
// COIN FLIP
// ==========================================
router.post("/coinflip", protect, async (req, res) => {
  const { betAmount, pick } = req.body;
  try {
    if (!betAmount || betAmount <= 0)
      return res.status(400).json({ message: "Invalid bet amount" });
    if (!["heads", "tails"].includes(pick))
      return res.status(400).json({ message: "Pick heads or tails" });

    const user = await User.findById(req.user._id);
    if (user.balance < betAmount)
      return res.status(400).json({ message: "Insufficient balance" });

    user.balance -= Number(betAmount);
    const result = Math.random() < 0.5 ? "heads" : "tails";
    const won = result === pick;
    const multiplier = 1.96;
    const payout = won ? (betAmount * multiplier).toFixed(2) : 0;

    if (won) user.balance += Number(payout);
    await user.save();

    await Transaction.create({
      userId: user._id,
      type: won ? "payout" : "bet",
      amount: Number(betAmount),
      status: "success",
      reference: "COIN_" + Date.now(),
      note: `CoinFlip: ${pick} | Got ${result} | ${won ? "Won" : "Lost"}`,
    });

    res.json({
      success: true,
      result,
      won,
      multiplier,
      payout: Number(payout),
      newBalance: user.balance,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==========================================
// PLINKO
// ==========================================
router.post("/plinko", protect, async (req, res) => {
  const { betAmount, rows, risk } = req.body;
  try {
    if (!betAmount || betAmount <= 0)
      return res.status(400).json({ message: "Invalid bet amount" });

    let numRows = Number(rows) || 12;
    const validRows = [8, 12, 16];
    if (!validRows.includes(numRows)) {
      numRows = validRows.reduce((prev, curr) =>
        Math.abs(curr - numRows) < Math.abs(prev - numRows) ? curr : prev
      );
    }

    const user = await User.findById(req.user._id);
    if (user.balance < betAmount)
      return res.status(400).json({ message: "Insufficient balance" });

    user.balance -= Number(betAmount);

    let position = 0;
    const path = [];
    for (let i = 0; i < numRows; i++) {
      const goRight = Math.random() < 0.5;
      if (goRight) position++;
      path.push(goRight ? "R" : "L");
    }

    const multipliers = {
      low: {
        8: [5.6, 2.1, 1.1, 1.0, 0.5, 1.0, 1.1, 2.1, 5.6],
        12: [8.1, 3.0, 1.6, 1.2, 0.9, 0.7, 0.7, 0.9, 1.2, 1.6, 3.0, 8.1],
        16: [16, 9, 2, 1.4, 1.4, 1.2, 1.1, 1.0, 0.5, 1.0, 1.1, 1.2, 1.4, 1.4, 2, 9, 16],
      },
      medium: {
        8: [13, 3, 1.3, 0.7, 0.4, 0.7, 1.3, 3, 13],
        12: [24, 5.6, 2.1, 1.1, 0.6, 0.4, 0.4, 0.6, 1.1, 2.1, 5.6, 24],
        16: [110, 41, 10, 3, 1.6, 1.1, 1, 0.7, 0.4, 0.7, 1, 1.1, 1.6, 3, 10, 41, 110],
      },
      high: {
        8: [29, 4, 1.5, 0.3, 0.2, 0.3, 1.5, 4, 29],
        12: [170, 24, 8.1, 2, 0.7, 0.2, 0.2, 0.7, 2, 8.1, 24, 170],
        16: [1000, 130, 26, 9, 4, 2, 0.2, 0.2, 0.2, 0.2, 0.2, 2, 4, 9, 26, 130, 1000],
      },
    };

    const riskKey = ["low", "medium", "high"].includes(risk) ? risk : "medium";
    const table = multipliers[riskKey][numRows];
    const multiplier = table[position];
    const payout = (betAmount * multiplier).toFixed(2);

    user.balance += Number(payout);
    await user.save();

    await Transaction.create({
      userId: user._id,
      type: "payout",
      amount: Number(betAmount),
      status: "success",
      reference: "PLINKO_" + Date.now(),
      note: `Plinko: ${numRows} rows | Slot ${position} | ${multiplier}x`,
    });

    res.json({
      success: true,
      path,
      position,
      multiplier,
      payout: Number(payout),
      newBalance: user.balance,
      rows: numRows,
      risk: riskKey,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==========================================
// MINES
// ==========================================
router.post("/mines/start", protect, async (req, res) => {
  const { betAmount, mineCount } = req.body;
  try {
    if (!betAmount || betAmount <= 0)
      return res.status(400).json({ message: "Invalid bet amount" });
    if (mineCount < 1 || mineCount > 24)
      return res.status(400).json({ message: "Mines must be 1-24" });

    const user = await User.findById(req.user._id);
    if (user.balance < betAmount)
      return res.status(400).json({ message: "Insufficient balance" });

    user.balance -= Number(betAmount);
    await user.save();

    const mines = [];
    while (mines.length < mineCount) {
      const pos = Math.floor(Math.random() * 25);
      if (!mines.includes(pos)) mines.push(pos);
    }

    const gameId = "MINES_" + Date.now() + "_" + Math.floor(Math.random() * 1000);

    global.minesGames[gameId] = {
      userId: user._id.toString(),
      betAmount: Number(betAmount),
      mineCount: Number(mineCount),
      mines,
      revealed: [],
      active: true,
    };

    res.json({
      success: true,
      gameId,
      mineCount,
      betAmount,
      newBalance: user.balance,
      totalTiles: 25,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/mines/reveal", protect, async (req, res) => {
  const { gameId, tileIndex } = req.body;
  try {
    const game = global.minesGames?.[gameId];
    if (!game) return res.status(404).json({ message: "Game not found" });
    if (game.userId !== req.user._id.toString())
      return res.status(403).json({ message: "Not your game" });
    if (!game.active) return res.status(400).json({ message: "Game ended" });
    if (game.revealed.includes(tileIndex))
      return res.status(400).json({ message: "Already revealed" });

    if (game.mines.includes(tileIndex)) {
      game.active = false;
      await Transaction.create({
        userId: req.user._id,
        type: "bet",
        amount: game.betAmount,
        status: "success",
        reference: gameId,
        note: `Mines: Hit mine | Lost ${game.betAmount}`,
      });
      const allMines = game.mines;
      delete global.minesGames[gameId];
      return res.json({ success: true, hitMine: true, mines: allMines });
    }

    game.revealed.push(tileIndex);
    const totalTiles = 25;
    const safeTiles = totalTiles - game.mineCount;
    let multiplier = 1;
    for (let i = 0; i < game.revealed.length; i++) {
      multiplier *= (totalTiles - i) / (safeTiles - i);
    }
    multiplier = (multiplier * 0.97).toFixed(2);
    const potentialWin = (game.betAmount * multiplier).toFixed(2);

    if (game.revealed.length === safeTiles) {
      game.active = false;
      const user = await User.findById(req.user._id);
      user.balance += Number(potentialWin);
      await user.save();
      delete global.minesGames[gameId];
      return res.json({
        success: true,
        hitMine: false,
        allRevealed: true,
        revealed: game.revealed,
        multiplier: Number(multiplier),
        payout: Number(potentialWin),
        newBalance: user.balance,
      });
    }

    res.json({
      success: true,
      hitMine: false,
      revealed: game.revealed,
      multiplier: Number(multiplier),
      potentialWin: Number(potentialWin),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/mines/cashout", protect, async (req, res) => {
  const { gameId } = req.body;
  try {
    const game = global.minesGames?.[gameId];
    if (!game) return res.status(404).json({ message: "Game not found" });
    if (game.userId !== req.user._id.toString())
      return res.status(403).json({ message: "Not your game" });
    if (!game.active) return res.status(400).json({ message: "Game ended" });
    if (game.revealed.length === 0)
      return res.status(400).json({ message: "Reveal at least 1" });

    const totalTiles = 25;
    const safeTiles = totalTiles - game.mineCount;
    let multiplier = 1;
    for (let i = 0; i < game.revealed.length; i++) {
      multiplier *= (totalTiles - i) / (safeTiles - i);
    }
    multiplier = (multiplier * 0.97).toFixed(2);
    const payout = (game.betAmount * multiplier).toFixed(2);

    const user = await User.findById(req.user._id);
    user.balance += Number(payout);
    await user.save();
    delete global.minesGames[gameId];

    res.json({
      success: true,
      multiplier: Number(multiplier),
      payout: Number(payout),
      newBalance: user.balance,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==========================================
// ROULETTE
// ==========================================
router.post("/roulette", protect, async (req, res) => {
  const { betAmount, bets } = req.body;
  try {
    if (!betAmount || betAmount <= 0)
      return res.status(400).json({ message: "Invalid bet amount" });
    if (!bets || bets.length === 0)
      return res.status(400).json({ message: "Place at least one bet" });

    const user = await User.findById(req.user._id);
    if (user.balance < betAmount)
      return res.status(400).json({ message: "Insufficient balance" });

    user.balance -= Number(betAmount);

    const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
    const result = Math.floor(Math.random() * 37);

    let totalPayout = 0;

    for (const bet of bets) {
      let betWon = false;
      let multiplier = 0;

      if (bet.type === "number" && Number(bet.value) === result) {
        betWon = true;
        multiplier = 36;
      } else if (bet.type === "red" && RED_NUMBERS.includes(result)) {
        betWon = true;
        multiplier = 2;
      } else if (
        bet.type === "black" &&
        result !== 0 &&
        !RED_NUMBERS.includes(result)
      ) {
        betWon = true;
        multiplier = 2;
      } else if (bet.type === "odd" && result !== 0 && result % 2 === 1) {
        betWon = true;
        multiplier = 2;
      } else if (bet.type === "even" && result !== 0 && result % 2 === 0) {
        betWon = true;
        multiplier = 2;
      } else if (bet.type === "low" && result >= 1 && result <= 18) {
        betWon = true;
        multiplier = 2;
      } else if (bet.type === "high" && result >= 19 && result <= 36) {
        betWon = true;
        multiplier = 2;
      } else if (bet.type === "dozen") {
        if (bet.value === 1 && result >= 1 && result <= 12) {
          betWon = true;
          multiplier = 3;
        } else if (bet.value === 2 && result >= 13 && result <= 24) {
          betWon = true;
          multiplier = 3;
        } else if (bet.value === 3 && result >= 25 && result <= 36) {
          betWon = true;
          multiplier = 3;
        }
      } else if (bet.type === "column") {
        if (bet.value === 1 && result !== 0 && result % 3 === 1) {
          betWon = true;
          multiplier = 3;
        } else if (bet.value === 2 && result !== 0 && result % 3 === 2) {
          betWon = true;
          multiplier = 3;
        } else if (bet.value === 3 && result !== 0 && result % 3 === 0) {
          betWon = true;
          multiplier = 3;
        }
      }

      if (betWon) totalPayout += bet.amount * multiplier;
    }

    if (totalPayout > 0) user.balance += Number(totalPayout.toFixed(2));
    await user.save();

    await Transaction.create({
      userId: user._id,
      type: totalPayout > 0 ? "payout" : "bet",
      amount: Number(betAmount),
      status: "success",
      reference: "ROULETTE_" + Date.now(),
      note: `Roulette: Result ${result} | ${bets.length} bets | ${
        totalPayout > 0 ? "Won " + totalPayout.toFixed(2) : "Lost"
      }`,
    });

    let color = "green";
    if (result !== 0) color = RED_NUMBERS.includes(result) ? "red" : "black";

    res.json({
      success: true,
      result,
      color,
      won: totalPayout > 0,
      payout: Number(totalPayout.toFixed(2)),
      newBalance: user.balance,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==========================================
// CRASH
// ==========================================
function generateCrashPoint(serverSeed, roundId) {
  const hash = crypto.createHmac("sha256", serverSeed).update(roundId).digest("hex");
  const h = parseInt(hash.slice(0, 8), 16);
  const e = Math.pow(2, 32);
  const result = Math.floor((100 * e - h) / (e - h)) / 100;
  return Math.max(1.0, result * 0.99);
}

router.post("/crash/start", protect, async (req, res) => {
  const { betAmount } = req.body;
  try {
    if (!betAmount || betAmount <= 0)
      return res.status(400).json({ message: "Invalid bet amount" });

    const user = await User.findById(req.user._id);
    if (user.balance < betAmount)
      return res.status(400).json({ message: "Insufficient balance" });

    user.balance -= Number(betAmount);
    await user.save();

    if (global.crashGame.status !== "running") {
      const serverSeed = crypto.randomBytes(32).toString("hex");
      const roundId = Date.now().toString();
      const serverSeedHash = crypto.createHash("sha256").update(serverSeed).digest("hex");
      const crashPoint = generateCrashPoint(serverSeed, roundId);

      global.crashGame = {
        roundId, serverSeed, serverSeedHash, crashPoint,
        startTime: Date.now(), status: "running", players: {},
        history: global.crashGame.history || [],
      };
    }

    global.crashGame.players[user._id.toString()] = {
      userId: user._id.toString(),
      name: user.name,
      betAmount: Number(betAmount),
      cashoutMultiplier: null,
      cashedOut: false,
      payout: 0,
    };

    res.json({
      success: true,
      roundId: global.crashGame.roundId,
      serverSeedHash: global.crashGame.serverSeedHash,
      newBalance: user.balance,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/crash/status", protect, async (req, res) => {
  try {
    const game = global.crashGame;
    if (game.status !== "running") {
      return res.json({
        success: true, status: game.status, roundId: game.roundId,
        serverSeedHash: game.serverSeedHash,
        crashPoint: game.status === "crashed" ? game.crashPoint : null,
        history: game.history.slice(-20),
      });
    }

    const elapsed = (Date.now() - game.startTime) / 1000;
    const multiplier = Math.pow(Math.E, 0.06 * elapsed);

    if (multiplier >= game.crashPoint) {
      game.status = "crashed";
      game.history.push({
        roundId: game.roundId, crashPoint: game.crashPoint,
        serverSeedHash: game.serverSeedHash, time: new Date(),
      });

      for (const playerId in game.players) {
        const player = game.players[playerId];
        if (!player.cashedOut) {
          await Transaction.create({
            userId: playerId, type: "bet", amount: player.betAmount,
            status: "success", reference: "CRASH_" + game.roundId,
            note: `Crash: Lost at ${game.crashPoint.toFixed(2)}x`,
          });
        }
      }

      return res.json({
        success: true, status: "crashed", roundId: game.roundId,
        crashPoint: game.crashPoint,
        serverSeedHash: game.serverSeedHash,
        history: game.history.slice(-20),
      });
    }

    res.json({
      success: true, status: "running", roundId: game.roundId,
      serverSeedHash: game.serverSeedHash,
      multiplier: Number(multiplier.toFixed(2)),
      elapsed: Number(elapsed.toFixed(2)),
      players: Object.values(game.players).map((p) => ({
        name: p.name, betAmount: p.betAmount,
        cashedOut: p.cashedOut, cashoutMultiplier: p.cashoutMultiplier,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/crash/cashout", protect, async (req, res) => {
  try {
    const game = global.crashGame;
    if (game.status !== "running")
      return res.status(400).json({ message: "Game not running" });

    const player = game.players[req.user._id.toString()];
    if (!player) return res.status(400).json({ message: "No bet placed" });
    if (player.cashedOut) return res.status(400).json({ message: "Already cashed out" });

    const elapsed = (Date.now() - game.startTime) / 1000;
    const multiplier = Math.pow(Math.E, 0.06 * elapsed);

    if (multiplier >= game.crashPoint)
      return res.status(400).json({ message: "Crashed! Too late" });

    player.cashedOut = true;
    player.cashoutMultiplier = Number(multiplier.toFixed(2));
    player.payout = Number((player.betAmount * multiplier).toFixed(2));

    const user = await User.findById(req.user._id);
    user.balance += player.payout;
    await user.save();

    await Transaction.create({
      userId: user._id, type: "payout", amount: player.payout,
      status: "success", reference: "CRASH_" + game.roundId,
      note: `Crash: Cashed out at ${player.cashoutMultiplier}x`,
    });

    res.json({
      success: true, multiplier: player.cashoutMultiplier,
      payout: player.payout, newBalance: user.balance,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==========================================
// TOWER
// ==========================================
const TOWER_DIFFICULTY = {
  easy: { tilesPerRow: 4, blocksPerRow: 1, totalRows: 8, name: "Easy" },
  medium: { tilesPerRow: 4, blocksPerRow: 2, totalRows: 8, name: "Medium" },
  hard: { tilesPerRow: 4, blocksPerRow: 3, totalRows: 8, name: "Hard" },
  extreme: { tilesPerRow: 4, blocksPerRow: 3, totalRows: 12, name: "Extreme" },
  nightmare: { tilesPerRow: 5, blocksPerRow: 4, totalRows: 15, name: "Nightmare" },
};

router.post("/tower/start", protect, async (req, res) => {
  const { betAmount, difficulty = "easy" } = req.body;
  try {
    if (!betAmount || betAmount <= 0)
      return res.status(400).json({ message: "Invalid bet amount" });

    const diff = TOWER_DIFFICULTY[difficulty];
    if (!diff) return res.status(400).json({ message: "Invalid difficulty" });

    const user = await User.findById(req.user._id);
    if (user.balance < betAmount)
      return res.status(400).json({ message: "Insufficient balance" });

    user.balance -= Number(betAmount);
    await user.save();

    const rows = [];
    for (let i = 0; i < diff.totalRows; i++) {
      const allTiles = Array.from({ length: diff.tilesPerRow }, (_, j) => j);
      const safeTiles = [];
      const safeCount = diff.tilesPerRow - diff.blocksPerRow;

      while (safeTiles.length < safeCount) {
        const rIdx = Math.floor(Math.random() * allTiles.length);
        safeTiles.push(allTiles[rIdx]);
        allTiles.splice(rIdx, 1);
      }

      rows.push({ safeTiles });
    }

    const gameId = "TOWER_" + Date.now() + "_" + Math.floor(Math.random() * 1000);

    global.towerGames[gameId] = {
      userId: user._id.toString(),
      betAmount: Number(betAmount),
      difficulty,
      tilesPerRow: diff.tilesPerRow,
      blocksPerRow: diff.blocksPerRow,
      totalRows: diff.totalRows,
      rows,
      currentRow: 0,
      revealedRows: [],
      active: true,
    };

    res.json({
      success: true,
      gameId,
      difficulty,
      tilesPerRow: diff.tilesPerRow,
      blocksPerRow: diff.blocksPerRow,
      totalRows: diff.totalRows,
      betAmount,
      newBalance: user.balance,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/tower/reveal", protect, async (req, res) => {
  const { gameId, tileIndex } = req.body;
  try {
    const game = global.towerGames?.[gameId];
    if (!game) return res.status(404).json({ message: "Game not found" });
    if (game.userId !== req.user._id.toString())
      return res.status(403).json({ message: "Not your game" });
    if (!game.active) return res.status(400).json({ message: "Game ended" });

    const currentRow = game.rows[game.currentRow];
    if (!currentRow) return res.status(400).json({ message: "Game complete" });

    const isSafe = currentRow.safeTiles.includes(tileIndex);

    if (!isSafe) {
      game.active = false;
      await Transaction.create({
        userId: req.user._id, type: "bet", amount: game.betAmount,
        status: "success", reference: gameId,
        note: `Tower: Hit block at row ${game.currentRow + 1}`,
      });
      const safeTiles = game.rows.map((r) => r.safeTiles);
      delete global.towerGames[gameId];
      return res.json({ success: true, hitBlock: true, safeTiles });
    }

    game.revealedRows.push({ row: game.currentRow, tileIndex });
    game.currentRow++;

    const totalTiles = game.tilesPerRow;
    const safeCount = game.tilesPerRow - game.blocksPerRow;
    let multiplier = 1;
    for (let i = 0; i < game.currentRow; i++) {
      multiplier *= totalTiles / safeCount;
    }
    multiplier = (multiplier * 0.97).toFixed(2);
    const potentialWin = (game.betAmount * multiplier).toFixed(2);

    if (game.currentRow >= game.totalRows) {
      game.active = false;
      const user = await User.findById(req.user._id);
      user.balance += Number(potentialWin);
      await user.save();
      await Transaction.create({
        userId: user._id, type: "payout", amount: Number(potentialWin),
        status: "success", reference: gameId,
        note: `Tower: Completed all rows | Won ${potentialWin}`,
      });
      delete global.towerGames[gameId];
      return res.json({
        success: true, hitBlock: false, allRevealed: true,
        revealedRows: game.revealedRows,
        multiplier: Number(multiplier), payout: Number(potentialWin),
        newBalance: user.balance,
      });
    }

    res.json({
      success: true, hitBlock: false,
      currentRow: game.currentRow,
      revealedRows: game.revealedRows,
      multiplier: Number(multiplier),
      potentialWin: Number(potentialWin),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/tower/cashout", protect, async (req, res) => {
  const { gameId } = req.body;
  try {
    const game = global.towerGames?.[gameId];
    if (!game) return res.status(404).json({ message: "Game not found" });
    if (game.userId !== req.user._id.toString())
      return res.status(403).json({ message: "Not your game" });
    if (!game.active) return res.status(400).json({ message: "Game ended" });
    if (game.currentRow === 0)
      return res.status(400).json({ message: "Reveal at least 1 row" });

    const totalTiles = game.tilesPerRow;
    const safeCount = game.tilesPerRow - game.blocksPerRow;
    let multiplier = 1;
    for (let i = 0; i < game.currentRow; i++) {
      multiplier *= totalTiles / safeCount;
    }
    multiplier = (multiplier * 0.97).toFixed(2);
    const payout = (game.betAmount * multiplier).toFixed(2);

    const user = await User.findById(req.user._id);
    user.balance += Number(payout);
    await user.save();

    await Transaction.create({
      userId: user._id, type: "payout", amount: Number(payout),
      status: "success", reference: gameId,
      note: `Tower: Cashed out at ${multiplier}x`,
    });

    delete global.towerGames[gameId];

    res.json({
      success: true,
      multiplier: Number(multiplier),
      payout: Number(payout),
      newBalance: user.balance,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;