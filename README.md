---

# Voting DApp

Este projeto é um DApp (Decentralized Application) de votação desenvolvido com **Solidity** para contratos inteligentes, **Web3.js** para a interação com a blockchain, **Ganache** para a blockchain local, e **Truffle** como framework de desenvolvimento.

## Pré-requisitos

Antes de começar, certifique-se de ter o seguinte instalado:

- **Node.js** (v16 ou superior)
- **Truffle**: Para compilar e migrar os contratos inteligentes. Instale globalmente com:
  ```bash
  npm install -g truffle
  ```
- **Ganache CLI**: Para rodar uma blockchain local de desenvolvimento. Instale globalmente com:
  ```bash
  npm install -g ganache-cli
  ```
- **Metamask**: Para interação com a blockchain via navegador.

---

## Instalação

1. Clone o repositório do projeto:

   ```bash
   git clone https://github.com/seu-repositorio/votingApp.git
   cd votingApp
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

---

## Scripts do Projeto

O projeto contém vários scripts úteis no arquivo `package.json`. Aqui está o que cada comando faz:

### 1. **`npm run ganache`**

Este comando inicia o **Ganache CLI**, uma blockchain Ethereum local para desenvolvimento. Ele roda no `localhost` na porta 8545 e usa um mnemônico fixo para garantir que os endereços e chaves privadas geradas sejam consistentes toda vez que o Ganache for iniciado.

```bash
npm run ganache
```

- **Ganache** é uma blockchain local que permite testar contratos inteligentes de forma rápida e fácil.
- O mnemônico fixo garante que os endereços das contas e as chaves privadas sejam as mesmas a cada execução, facilitando o desenvolvimento.

**Comando definido no `package.json`:**

```json
"ganache": "ganache-cli -p 8545 -i 1337 --mnemonic 'vacuum bean armed collect broken sleep marine shaft buffalo left enact sign'"
```

### 2. **`npm run clean`**

Este comando remove os artefatos de contratos antigos (`build/`) e qualquer arquivo `.json` do diretório `src/`. Isso garante que a próxima compilação e migração dos contratos seja limpa e sem conflitos com versões antigas.

```bash
npm run clean
```

- **Objetivo**: Limpar todos os artefatos antigos para que os novos contratos compilados sejam migrados sem conflitos.

**Comando definido no `package.json`:**

```json
"clean": "rimraf build/ src/*.json"
```

### 3. **`npm run build`**

Este comando executa o ciclo completo de desenvolvimento para compilar, migrar e preparar o projeto:

```bash
npm run build
```

Esse comando executa uma sequência de etapas:

- **Limpa** os artefatos antigos com `npm run clean`.
- **Compila** os contratos Solidity com o Truffle (`truffle compile`).
- **Migra** os contratos para a blockchain local (Ganache) com o comando `truffle migrate --reset --network development`.
- **Copia** os artefatos de contrato `.json` para o diretório `src/` para que o frontend possa interagir com os contratos.

**Comandos executados no `package.json`:**

```json
"build": "npm-run-all clean compile migrate copy-contracts"
```

### 4. **`truffle migrate --reset --network development`**

Esse comando migra os contratos inteligentes compilados para a rede local (neste caso, a instância do Ganache). O parâmetro `--reset` força a reimplantação dos contratos, mesmo que já tenham sido migrados anteriormente.

```bash
truffle migrate --reset --network development
```

- **Migrate**: Implementa os contratos inteligentes na rede especificada. No caso, o Ganache local (rede `development`).
- **Reset**: Reimplanta todos os contratos, mesmo se eles já estiverem na rede. Isso é útil para garantir que qualquer alteração recente seja aplicada.

### 5. **`npm run copy-contracts`**

Este comando copia os artefatos `.json` gerados pelo Truffle durante a compilação e migração dos contratos para a pasta `src/`, onde o frontend pode acessá-los para interagir com os contratos.

```bash
npm run copy-contracts
```

- **Objetivo**: Mover os contratos compilados para o frontend. O arquivo `.json` contém o ABI (Application Binary Interface) e o endereço do contrato na rede, permitindo a interação via Web3.js.

**Comando definido no `package.json`:**

```json
"copy-contracts": "copyfiles -u 1 \"build/contracts/*.json\" src/"
```

### 6. **`npm run start`**

Este comando executa o ciclo completo de inicialização da aplicação, incluindo a execução do Ganache, migração de contratos e inicialização do servidor frontend:

```bash
npm run start
```

O ciclo de execução inclui os seguintes passos:

- Inicia o servidor frontend usando o **Live Server** para servir os arquivos no diretório `src/` na porta 8080.

**Comandos executados no `package.json`:**

```json
"start": "npm-run-all -p start-frontend"
```

---

## Fluxo Completo de Inicialização

Aqui está o fluxo completo que você pode seguir para começar a desenvolver ou testar o DApp de votação:

1. **Inicie o Ganache**:

   ```bash
   npm run ganache
   ```

2. **Limpe os artefatos antigos**:

   ```bash
   npm run clean
   ```

3. **Compile os contratos inteligentes**:

   ```bash
   npm run build
   ```

4. **Implemente os contratos na rede local**:

   ```bash
   truffle migrate --reset --network development
   ```

5. **Copie os contratos para o frontend**:

   ```bash
   npm run copy-contracts
   ```

6. **Inicie o servidor frontend**:
   ```bash
   npm run start
   ```

---

## Ordem de Inicialização

```bash
npm run ganache
```

```bash
npm run clean
npm run build
truffle migrate --reset --network development
npm run copy-contracts
npm run start
```

## Licença

Este projeto está licenciado sob a [MIT License](./LICENSE).

---

## Conclusão

Esse README fornece um fluxo claro de como configurar e rodar o DApp de votação, juntamente com comentários que explicam cada etapa do processo. Isso facilita o entendimento de como a aplicação interage com a blockchain local, compila contratos e serve o frontend.

Se você tiver alguma dúvida ou encontrar algum erro durante o processo, verifique os logs do console (tanto do navegador quanto do Ganache) para mais detalhes.
