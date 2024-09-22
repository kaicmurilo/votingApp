// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Voting {
    struct Candidate {
        uint id;
        string name;
        uint voteCount;
    }

    struct Voter {
        bool authorized;
        bool voted;
        uint vote;
    }

    address public owner;
    string public electionName;
    uint public startTime;
    uint public endTime;

    mapping(address => Voter) public voters;
    Candidate[] public candidates;
    uint public totalVotes;

    event Voted(address voter, uint candidateId);
    event CandidateAdded(string name);
    event Authorized(address voter);
    event VotingFailed(address voter, string reason);

    modifier ownerOnly() {
        require(
            msg.sender == owner,
            unicode"Apenas o dono pode executar esta função."
        );
        _;
    }

    modifier duringVoting() {
        require(
            block.timestamp >= startTime && block.timestamp <= endTime,
            unicode"Fora do período de votação."
        );
        _;
    }

    constructor(string memory _name, uint _duration) {
        owner = msg.sender;
        electionName = _name;
        startTime = block.timestamp;
        endTime = block.timestamp + _duration;
    }

    function addCandidate(string memory _name) public ownerOnly {
        candidates.push(Candidate(candidates.length, _name, 0));
    }

    function getNumCandidates() public view returns (uint) {
        return candidates.length;
    }

    function authorize(address _person) public ownerOnly {
        voters[_person].authorized = true;
    }

    function vote(uint _candidateId) public duringVoting {
        Voter storage sender = voters[msg.sender];
        if (sender.voted) {
            emit VotingFailed(msg.sender, unicode"Você já votou.");
            revert(unicode"Você já votou.");
        }
        if (_candidateId >= candidates.length) {
            emit VotingFailed(msg.sender, unicode"Candidato inválido.");
            revert(unicode"Candidato inválido.");
        }

        sender.voted = true;
        sender.vote = _candidateId;

        candidates[_candidateId].voteCount += 1;
        totalVotes += 1;

        emit Voted(msg.sender, _candidateId);
    }

    function end() public ownerOnly {
        // Implementar lógica para encerrar a eleição
    }
}
