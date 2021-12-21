
function ERC20(owner)
{
    
    this._totalSupply = 1;
    this._maxSupply = 1000000;
    this._balances = {};
    this._mintForOwner = 0.01;
    this._owner = owner;

    //initial mint for owner
    this.mint(this._owner , this._maxSupply *  this._mintForOwner);


    this.mint = function (wallet, tokens)
    {
        this._balances[wallet] = tokens;
        this._totalSupply += tokens;
    }

    this.transfer = function(sender, recipient, amount)
    {
        let senderBalance = this._balances[sender];
        if( amount >= senderBalance) throw  Error("ERC20: transfer amount exceeds balance")

        this._balances[sender] = senderBalance - amount;
        this._balances[recipient] ? this._balances[recipient] += amount : this._balances[recipient] =  amount;
    }

    this.balanceOf = function(address)
    {
        return this._balances[address] || 0;
    } 

    this.owners = function(){
        return this._balances;
    }
    this.maxSupply = function (){
        return this._maxSupply;
    }
}

function ERC1155(owner)
{
    
    this._maxSupply = {};
    this._totalSupply = {};
    this._balances = {};
    this._ipr = 0.40; 
    this._owner = owner;
    this._issuedCount = 0;

    this.issueCount = function(){
        return this._issuedCount;
    }

    this.balanceOf = function(address, id){
        return this._balances[id][address];
    }

    this.issue = function(sender, id, maxSupply, idxAddress)
    {
        if(sender != this._owner) throw Error('ERC1155: NOT_THE_OWNER');

        this._maxSupply[id] = maxSupply;
        this._balances[id] = {}
        //mint the IPR fator to index contractor
        this._issuedCount ++;
        this.mint(idxAddress, id, (maxSupply * this._ipr) );

    } 

    this.transferFrom = function(from, to, id, amount )
    {
        let fromBalance = this._balances[id][from];
        if(fromBalance >= amount ) throw ('ERC1155: insufficient balance for transfer');
        
        this._balances_balances[id][from] = fromBalance - amount;
        this._balances[id][to] += amount;

        //emit events
    }

    this.mint = function (to, id, amount)
    {
        if(amount <= 0 ) throw Error('ERC1155: Amount should be great then 0');
        if(this._totalSupply[id] + amount > this._maxSupply[id] ) throw Error('ERC1155: ERR_EXCEEDED_MAX_SUPPLY');
        // console.log('debug ', amount );

        //update the total supply of id 
        this._totalSupply[id] =   this._totalSupply[id] ?  this._totalSupply[id] + amount : amount;
        //set the map balance of id to that wallet with amuont
        this._balances[id][to] =  this._balances[id][to] ?   this._balances[id][to] + amount : amount ;
    }

    this.balanceAll = function(){
        return this._balances;
    }

    this.totalBalance = function(sender)
    {
        let total = 0;
        for (let elem in this._balances ) {

            // console.log('elem .: ', this._balances[elem][sender] )
            total += this._balances[elem][sender];
        }
        return total;
    }

    this.maxSupply = function ()
    {
        return this._maxSupply;
    }
}


function CreatorIndex(idxWa){

    this._maxSupply = 100000000;
    this._idxWa = idxWa;

    //stake the contract
    this.stake = function (sender, id, ntfTokens, erc20, erc1155 )
    {

        console.log('erc20 balance IDX_POOL : ', erc20.balanceOf(this._idxWa) )
        console.log('ERC1155 IDX_POOL  id: ', id , ' balance ' , erc1155.balanceOf(this._idxWa , id ) )

        if(erc1155.balanceOf(indexWA, id ) - ntfTokens < 0) throw Error('IDX_POOL: There arent this amount of token available on contract')

       // nominal value of token after the buy
       // usar o totalSupply() em vez do maxSupply()
       let nValue =  (erc20.maxSupply() - erc20.balanceOf(this._idxWa) )   / erc1155.issueCount() /  ( erc1155.balanceOf(this._idxWa , id ) - ntfTokens );

       console.log('Buy intention N ofTokens : ', ntfTokens, ' intention value: ' , nValue)
       
       //multiply nominal value for the number of tokens owner wants to move
       let balanceToMove = nValue * ntfTokens;
       console.log('tokens to move : ', balanceToMove )

       //tranfer the quantity of tokens from user to idx pool
       if(erc20.balanceOf(sender) < balanceToMove ) throw Error('IDX_POOL: Buyer wont have the balance for that amount')
       erc20.transfer(sender,  this._idxWa, balanceToMove);

       //transer the other way around from index pool to user
       erc1155.transferFrom(this._idxWa, sender, id, ntfTokens)
       

    }

    this.unstake = function (){
        
        console.log('erc20 balance IDX_POOL : ', erc20.balanceOf(this._idxWa) )
        console.log('ERC1155 IDX_POOL  id: ', id , ' balance ' , erc1155.balanceOf(this._idxWa , id ) )

        if(erc1155.balanceOf(indexWA, id ) - ntfTokens < 0) throw Error('IDX_POOL: There arent this amount of token available on contract')

       // nominal value of token after the buy
       let nValue =  (erc20.maxSupply() + erc20.balanceOf(this._idxWa) )   / erc1155.issueCount() /  ( erc1155.balanceOf(this._idxWa , id ) + ntfTokens );

       console.log('Buy intention N ofTokens : ', ntfTokens, ' intention value: ' , nValue)
       
       let balanceToMove = nValue * ntfTokens;

       console.log('tokens to move : ', balanceToMove )

       if(erc20.balanceOf(sender) < balanceToMove ) throw Error('IDX_POOL: Buyer wont have the balance for that amount')
       erc20.transfer(sender,  this._idxWa, balanceToMove);
       erc1155.transferFrom(this._idxWa, sender, id, ntfTokens)


    }
}


let erc20WA = '0x99999';
let indexWA = '0x88888';
let drBrownWA = '0x1111111'
let s3mzWA   = '0x2222222'
let godInMakingWA   = '0x33333'


let erc20 = new ERC20();
let max =  erc20.maxSupply();
erc20.mint(drBrownWA, 100000);
erc20.mint(s3mzWA, 200000);
erc20.mint(godInMakingWA, 50000);
console.log('ERC20 owners ', erc20.owners() );

// ERC1155
let erc1155 = new ERC1155(drBrownWA);
erc1155.issue(drBrownWA, 1, 10000,  indexWA)
erc1155.issue(drBrownWA, 2, 5000,  indexWA)
erc1155.issue(drBrownWA, 3, 1000,  indexWA)
// erc1155.issue(drBrownWA, 4, 10,  indexWA)


erc1155.mint(s3mzWA, 1, 10000)
erc1155.mint(godInMakingWA, 2, 5000)
erc1155.mint(drBrownWA, 3, 1000)


console.log('ERC1155 balance ', erc1155.balanceAll() );


let idxBalance = erc1155.totalBalance(indexWA);
console.log('Total balance idx : ', idxBalance );

//buy intention

//unitary value for - for each of balance
let nValue1 = erc20.maxSupply() / erc1155.issueCount() / erc1155.balanceOf(indexWA, 1)
let nValue2 = erc20.maxSupply() / erc1155.issueCount() / erc1155.balanceOf(indexWA, 2)
let nValue3 = erc20.maxSupply() / erc1155.issueCount() / erc1155.balanceOf(indexWA, 3)

console.log('Nominal Val. 1 : ',  nValue1);
console.log('Nominal Val. 2 : ',  nValue2);
console.log('Nominal Val. 3 : ',  nValue3);

let poolIdx = new CreatorIndex(indexWA);
 poolIdx.stake(drBrownWA, 1, 300, erc20, erc1155)


console.log('ERC20 owners ', erc20.owners() );

// console.log('ERC1155 balance ', erc1155.balanceAll() );
