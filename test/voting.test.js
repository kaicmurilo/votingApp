const Voting = artifacts.require("Voting");
const { expectRevert, time } = require("@openzeppelin/test-helpers");

contract("Voting", (accounts) => {
  let votingInstance;

  before(async () => {
    const electionDuration = 86400; // 1 dia
    votingInstance = await Voting.new("Eleição Estudantil", electionDuration);
  });

  it("deve inicializar com o nome da eleição", async () => {
    const name = await votingInstance.electionName();
    assert.equal(
      name,
      "Eleição Estudantil",
      "O nome da eleição não está correto"
    );
  });

  it("deve permitir que o dono adicione candidatos", async () => {
    await votingInstance.addCandidate("Alice", { from: accounts[0] });
    await votingInstance.addCandidate("Bob", { from: accounts[0] });
    const numCandidates = await votingInstance.getNumCandidates();
    assert.equal(
      numCandidates.toNumber(),
      2,
      "O número de candidatos deve ser 2"
    );
  });

  it("deve permitir que o dono autorize eleitores", async () => {
    await votingInstance.authorize(accounts[1], { from: accounts[0] });
    const voter = await votingInstance.voters(accounts[1]);
    assert.equal(voter.authorized, true, "O eleitor deve estar autorizado");
  });

  it("deve permitir que um eleitor autorizado vote durante o período de votação", async () => {
    await votingInstance.vote(0, { from: accounts[1] });
    const voter = await votingInstance.voters(accounts[1]);
    assert.equal(voter.voted, true, "O eleitor deve ter votado");
    const candidate = await votingInstance.candidates(0);
    assert.equal(
      candidate.voteCount.toNumber(),
      1,
      "O candidato deve ter um voto"
    );
  });

  it("não deve permitir que um eleitor não autorizado vote", async () => {
    await expectRevert(
      votingInstance.vote(1, { from: accounts[2] }),
      "Você não está autorizado a votar."
    );
  });

  it("não deve permitir votar fora do período de votação", async () => {
    // Avance o tempo além do período de votação
    await time.increase(86401); // Aumenta o tempo em 86401 segundos

    await expectRevert(
      votingInstance.vote(0, { from: accounts[1] }),
      "Fora do período de votação."
    );
  });
});
