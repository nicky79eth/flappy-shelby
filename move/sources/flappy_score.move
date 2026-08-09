module flappy_shelby::flappy_score {
    use std::signer;
    use std::vector;
    use aptos_framework::account;
    use aptos_framework::event;
    use aptos_std::table::{Self, Table};

    struct ScoreBoard has key {
        best: Table<address, u64>,
        players: vector<address>,
    }

    #[event]
    struct ScoreSubmitted has drop, store {
        player: address,
        score: u64,
        is_new_best: bool,
    }

    public entry fun init(admin: &signer) {
        move_to(admin, ScoreBoard { best: table::new(), players: vector::empty() });
    }

    public entry fun submit_score(player: &signer, score: u64) acquires ScoreBoard {
        assert!(score > 0, 1);
        assert!(score <= 1000000, 2);
        let board = borrow_global_mut<ScoreBoard>(@flappy_shelby);
        let addr = signer::address_of(player);
        let mut new_best = false;
        if (table::contains(&board.best, addr)) {
            let old = table::borrow_mut(&mut board.best, addr);
            if (score > *old) { *old = score; new_best = true; };
        } else {
            table::add(&mut board.best, addr, score);
            vector::push_back(&mut board.players, addr);
            new_best = true;
        };
        event::emit(ScoreSubmitted { player: addr, score, is_new_best: new_best });
    }

    #[view]
    public fun get_best(player: address): u64 acquires ScoreBoard {
        let board = borrow_global<ScoreBoard>(@flappy_shelby);
        if (table::contains(&board.best, player)) *table::borrow(&board.best, player) else 0
    }

    #[view]
    public fun leaderboard(limit: u64): vector<LeaderboardRow> acquires ScoreBoard {
        let board = borrow_global<ScoreBoard>(@flappy_shelby);
        let rows = vector::empty<LeaderboardRow>();
        let i = 0;
        let n = vector::length(&board.players);
        while (i < n) {
            let p = *vector::borrow(&board.players, i);
            let s = *table::borrow(&board.best, p);
            vector::push_back(&mut rows, LeaderboardRow { player: p, score: s });
            i = i + 1;
        };
        sort_desc(&mut rows);
        let out = vector::empty<LeaderboardRow>();
        let j = 0;
        let take = if (limit < vector::length(&rows)) limit else vector::length(&rows);
        while (j < take) { vector::push_back(&mut out, *vector::borrow(&rows, j)); j = j + 1; };
        out
    }

    struct LeaderboardRow has copy, drop, store { player: address, score: u64 }

    fun sort_desc(rows: &mut vector<LeaderboardRow>) {
        let n = vector::length(rows); let i = 0;
        while (i < n) { let j = i + 1; while (j < n) {
            if (vector::borrow(rows, j).score > vector::borrow(rows, i).score) {
                vector::swap(rows, i, j);
            }; j = j + 1;
        }; i = i + 1; };
    }
}
