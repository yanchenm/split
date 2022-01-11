# Build/Test/Develop

Runs with foundry so install it to build/test/develop:
`cargo install --git https://github.com/gakonst/foundry --bin forge --locked`

From root dir (/split/contract):
`forge build`
or
`forge build --root .`

forge create --optimize --private-key 011daa76fb52b6c2d2b7e0f61c6417cc7d78cddf6ec88053b1e0fe65aa4641a9 --rpc-url https://api.s0.b.hmny.io --from 0xb6B0c0503c2A3Ab1952EF52B8B5902b7DA385842 -o ./out --root . MultiSend

cargo run --bin forge create --optimize --private-key 011daa76fb52b6c2d2b7e0f61c6417cc7d78cddf6ec88053b1e0fe65aa4641a9 --rpc-url https://api.s0.b.hmny.io --from 0xb6B0c0503c2A3Ab1952EF52B8B5902b7DA385842 -o ./out --root ../split/contract ../split/contract/src/MultiSend.sol:MultiSend