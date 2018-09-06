pragma solidity ^0.4.24;


/**
 * @title ERC20 interface
 * @dev see https://github.com/ethereum/EIPs/issues/20
 */
interface IERC20 {
  function totalSupply() external view returns (uint256);

  function balanceOf(address _who) external view returns (uint256);

  function allowance(address _owner, address _spender) external view returns (uint256);

  function transfer(address _to, uint256 _value) external returns (bool);

  function approve(address _spender, uint256 _value) external returns (bool);

  function transferFrom(address _from, address _to, uint256 _value) external returns (bool);

  event Transfer(
    address indexed from,
    address indexed to,
    uint256 value
  );

  event Approval(
    address indexed owner,
    address indexed spender,
    uint256 value
  );
}


/**
 * @title SafeMath
 * @dev Math operations with safety checks that revert on error
 */
library SafeMath {

    /**
    * @dev Multiplies two numbers, reverts on overflow.
    */
    function mul(uint256 _a, uint256 _b) internal pure returns (uint256) {
        // Gas optimization: this is cheaper than requiring 'a' not being zero, but the
        // benefit is lost if 'b' is also tested.
        // See: https://github.com/OpenZeppelin/openzeppelin-solidity/pull/522
        if (_a == 0) {
            return 0;
        }

        uint256 c = _a * _b;
        require(c / _a == _b);

        return c;
    }

    /**
    * @dev Integer division of two numbers truncating the quotient, reverts on division by zero.
    */
    function div(uint256 _a, uint256 _b) internal pure returns (uint256) {
        require(_b > 0); // Solidity only automatically asserts when dividing by 0
        uint256 c = _a / _b;
        // assert(_a == _b * c + _a % _b); // There is no case in which this doesn't hold

        return c;
    }

    /**
    * @dev Subtracts two numbers, reverts on overflow (i.e. if subtrahend is greater than minuend).
    */
    function sub(uint256 _a, uint256 _b) internal pure returns (uint256) {
        require(_b <= _a);
        uint256 c = _a - _b;

        return c;
    }

    /**
    * @dev Adds two numbers, reverts on overflow.
    */
    function add(uint256 _a, uint256 _b) internal pure returns (uint256) {
        uint256 c = _a + _b;
        require(c >= _a);

        return c;
    }

    /**
    * @dev Divides two numbers and returns the remainder (unsigned integer modulo),
    * reverts when dividing by zero.
    */
    function mod(uint256 a, uint256 b) internal pure returns (uint256) {
        require(b != 0);
        return a % b;
    }
}


/**
 * @title Standard ERC20 token
 * @dev Implementation of the basic standard token.
 */
contract ERC20 is IERC20 {
    using SafeMath for uint256;

    mapping (address => uint256) internal balances_;

    mapping (address => mapping (address => uint256)) private allowed_;

    uint256 private totalSupply_;

    /**
    * @dev Total number of tokens in existence
    */
    function totalSupply() public view returns (uint256) {
        return totalSupply_;
    }

    /**
    * @dev Gets the balance of the specified address.
    * @param _owner The address to query the the balance of.
    * @return An uint256 representing the amount owned by the passed address.
    */
    function balanceOf(address _owner) public view returns (uint256) {
        return balances_[_owner];
    }

  /**
   * @dev Function to check the amount of tokens that an owner allowed to a spender.
   * @param _owner address The address which owns the funds.
   * @param _spender address The address which will spend the funds.
   * @return A uint256 specifying the amount of tokens still available for the spender.
   */
    function allowance(
        address _owner,
        address _spender
    )
      public
      view
      returns (uint256)
    {
        return allowed_[_owner][_spender];
    }

    /**
    * @dev Transfer token for a specified address
    * @param _to The address to transfer to.
    * @param _value The amount to be transferred.
    */
    function transfer(address _to, uint256 _value) public returns (bool) {
        require(_value <= balances_[msg.sender]);
        require(_to != address(0));

        balances_[msg.sender] = balances_[msg.sender].sub(_value);
        balances_[_to] = balances_[_to].add(_value);
        emit Transfer(msg.sender, _to, _value);
        return true;
    }

    /**
    * @dev Approve the passed address to spend the specified amount of tokens on behalf of msg.sender.
    * Beware that changing an allowance with this method brings the risk that someone may use both the old
    * and the new allowance by unfortunate transaction ordering. One possible solution to mitigate this
    * race condition is to first reduce the spender's allowance to 0 and set the desired value afterwards:
    * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
    * @param _spender The address which will spend the funds.
    * @param _value The amount of tokens to be spent.
    */
    function approve(address _spender, uint256 _value) public returns (bool) {
        allowed_[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    /**
    * @dev Transfer tokens from one address to another
    * @param _from address The address which you want to send tokens from
    * @param _to address The address which you want to transfer to
    * @param _value uint256 the amount of tokens to be transferred
    */
    function transferFrom(
        address _from,
        address _to,
        uint256 _value
    )
      public
      returns (bool)
    {
        require(_value <= balances_[_from]);
        require(_value <= allowed_[_from][msg.sender]);
        require(_to != address(0));

        balances_[_from] = balances_[_from].sub(_value);
        balances_[_to] = balances_[_to].add(_value);
        allowed_[_from][msg.sender] = allowed_[_from][msg.sender].sub(_value);
        emit Transfer(_from, _to, _value);
        return true;
    }

  /**
   * @dev Increase the amount of tokens that an owner allowed to a spender.
   * approve should be called when allowed_[_spender] == 0. To increment
   * allowed value is better to use this function to avoid 2 calls (and wait until
   * the first transaction is mined)
   * From MonolithDAO Token.sol
   * @param _spender The address which will spend the funds.
   * @param _addedValue The amount of tokens to increase the allowance by.
   */
    function increaseApproval(
        address _spender,
        uint256 _addedValue
    )
      public
      returns (bool)
    {
        allowed_[msg.sender][_spender] = (allowed_[msg.sender][_spender].add(_addedValue));
        emit Approval(msg.sender, _spender, allowed_[msg.sender][_spender]);
        return true;
    }

    /**
    * @dev Decrease the amount of tokens that an owner allowed to a spender.
    * approve should be called when allowed_[_spender] == 0. To decrement
    * allowed value is better to use this function to avoid 2 calls (and wait until
    * the first transaction is mined)
    * From MonolithDAO Token.sol
    * @param _spender The address which will spend the funds.
    * @param _subtractedValue The amount of tokens to decrease the allowance by.
    */
    function decreaseApproval(
        address _spender,
        uint256 _subtractedValue
    )
      public
      returns (bool)
    {
        uint256 oldValue = allowed_[msg.sender][_spender];
        if (_subtractedValue >= oldValue) {
            allowed_[msg.sender][_spender] = 0;
        } else {
            allowed_[msg.sender][_spender] = oldValue.sub(_subtractedValue);
        }
        emit Approval(msg.sender, _spender, allowed_[msg.sender][_spender]);
        return true;
    }

    /**
    * @dev Internal function that mints an amount of the token and assigns it to
    * an account. This encapsulates the modification of balances such that the
    * proper events are emitted.
    * @param _account The account that will receive the created tokens.
    * @param _amount The amount that will be created.
    */
    function _mint(address _account, uint256 _amount) internal {
        require(_account != 0);
        totalSupply_ = totalSupply_.add(_amount);
        balances_[_account] = balances_[_account].add(_amount);
        emit Transfer(address(0), _account, _amount);
    }

    /**
    * @dev Internal function that burns an amount of the token of a given
    * account.
    * @param _account The account whose tokens will be burnt.
    * @param _amount The amount that will be burnt.
    */
    function _burn(address _account, uint256 _amount) internal {
        require(_account != 0);
        require(_amount <= balances_[_account]);

        totalSupply_ = totalSupply_.sub(_amount);
        balances_[_account] = balances_[_account].sub(_amount);
        emit Transfer(_account, address(0), _amount);
    }

    /**
    * @dev Internal function that burns an amount of the token of a given
    * account, deducting from the sender's allowance for said account. Uses the
    * internal _burn function.
    * @param _account The account whose tokens will be burnt.
    * @param _amount The amount that will be burnt.
    */
    function _burnFrom(address _account, uint256 _amount) internal {
        require(_amount <= allowed_[_account][msg.sender]);

        // Should https://github.com/OpenZeppelin/zeppelin-solidity/issues/707 be accepted,
        // this function needs to emit an event with the updated approval.
        allowed_[_account][msg.sender] = allowed_[_account][msg.sender].sub(_amount);
        _burn(_account, _amount);
    }
}


/**
 * @title SafeERC20
 * @dev Wrappers around ERC20 operations that throw on failure.
 * To use this library you can add a `using SafeERC20 for ERC20;` statement to your contract,
 * which allows you to call the safe operations as `token.safeTransfer(...)`, etc.
 */
library SafeERC20 {
    function safeTransfer(
        IERC20 _token,
        address _to,
        uint256 _value
    )
      internal
    {
        require(_token.transfer(_to, _value));
    }

    function safeTransferFrom(
        IERC20 _token,
        address _from,
        address _to,
        uint256 _value
    )
      internal
    {
        require(_token.transferFrom(_from, _to, _value));
    }

    function safeApprove(
        IERC20 _token,
        address _spender,
        uint256 _value
    )
      internal
    {
        require(_token.approve(_spender, _value));
    }
}


/**
 * @title Pausable
 * @dev Base contract which allows children to implement an emergency stop mechanism.
 */
contract Pausable {
    event Paused();
    event Unpaused();

    bool public paused = false;


    /**
    * @dev Modifier to make a function callable only when the contract is not paused.
    */
    modifier whenNotPaused() {
        require(!paused,"Contract is paused, sorry");
        _;
    }

    /**
    * @dev Modifier to make a function callable only when the contract is paused.
    */
    modifier whenPaused() {
        require(paused);
        _;
    }

}


/**
 * @title Pausable token
 * @dev ERC20 modified with pausable transfers.
 **/
contract ERC20Pausable is ERC20, Pausable {

    function transfer(address _to, uint256 _value) public whenNotPaused returns (bool) {
        return super.transfer(_to, _value);
    }

    function transferFrom(address _from, address _to, uint256 _value) public whenNotPaused returns (bool) {
        return super.transferFrom(_from, _to, _value);
    }

    function approve(address _spender, uint256 _value) public whenNotPaused returns (bool) {
        return super.approve(_spender, _value);
    }

    function increaseApproval(address _spender, uint _addedValue) public whenNotPaused returns (bool success) {
        return super.increaseApproval(_spender, _addedValue);
    }

    function decreaseApproval(address _spender, uint _subtractedValue) public whenNotPaused returns (bool success) {
        return super.decreaseApproval(_spender, _subtractedValue);
    }
}

/**
 * @title Contract RESTO token
 * @dev ERC20 compatible token contract
 */
contract RESTOToken is ERC20Pausable {
    string public constant name = "RESTO";
    string public constant symbol = "RESTO";
    uint32 public constant decimals = 18;
    uint256 public INITIAL_SUPPLY = 1100000000 * 1 ether; // 1 100 000 000
    address public CrowdsaleAddress;


    constructor(address _CrowdsaleAddress) public {
    
        CrowdsaleAddress = _CrowdsaleAddress;
        _mint(_CrowdsaleAddress, INITIAL_SUPPLY);
    }

    modifier onlyOwner() {
        require(msg.sender == CrowdsaleAddress,"Only CrowdSale contract can run this");
        _;
    }
    
    /**
     * @dev function transfer tokens from special address to users
     * can run only from crowdsale contract
    */
    function transferTokensFromSpecialAddress(address _from, address _to, uint256 _value) public onlyOwner whenNotPaused returns (bool){
        require (balances_[_from] >= _value,"Decrease value");
        balances_[_from] = balances_[_from].sub(_value);
        balances_[_to] = balances_[_to].add(_value);
        emit Transfer(_from, _to, _value);
        return true;
    }

    /**
     * @dev called by the owner to pause, triggers stopped state
     */
    function pause() public onlyOwner whenNotPaused {
        paused = true;
        emit Paused();
    }

    /**
     * @dev called by the owner to unpause, returns to normal state
     */
    function unpause() public onlyOwner whenPaused {
        paused = false;
        emit Unpaused();
    }

    function() external payable {
        revert("The token contract don`t receive ether");
    }  
}



/**
 * @title Ownable
 * @dev The Ownable contract has an owner and manager addresses, and provides basic authorization control
 * functions, this simplifies the implementation of "user permissions".
 */
contract Ownable {
    address public owner;
    address public manager;
    address candidate;

    constructor() public {
        owner = msg.sender;
        manager = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner,"Access denied");
        _;
    }

    modifier restricted() {
        require(msg.sender == owner || msg.sender == manager,"Access denied");
        _;
    }

    function transferOwnership(address _newOwner) public onlyOwner {
        require(_newOwner != address(0),"Invalid address");
        candidate = _newOwner;
    }

    function setManager(address _newManager) public onlyOwner {
        manager = _newManager;
    }


    function confirmOwnership() public {
        require(candidate == msg.sender,"Only from candidate");
        owner = candidate;
        delete candidate;
    }

}


contract TeamAddress1 {
    function() external payable {
        revert("The contract don`t receive ether");
    } 
}


contract TeamAddress2 {
    function() external payable {
        revert("The contract don`t receive ether");
    } 
}


contract MarketingAddress {
    function() external payable {
        revert("The contract don`t receive ether");
    } 
}


contract RetailersAddress {
    function() external payable {
        revert("The contract don`t receive ether");
    } 
}


contract ReserveAddress {
    function() external payable {
        revert("The contract don`t receive ether");
    } 
}


contract BountyAddress {
    function() external payable {
        revert("The contract don`t receive ether");
    } 
}


/**
 * @title Crowdsale
 * @dev Crowdsale is a base contract for managing a token crowdsale
 */
contract Crowdsale is Ownable {
    using SafeMath for uint256;
    using SafeERC20 for RESTOToken;

    uint256 hardCap = 50000 * 1 ether;
    address myAddress = this;
    RESTOToken public token = new RESTOToken(myAddress);
    uint64 crowdSaleEndTime = 1544745600; // 14.12.2018

    //Addresses for store tokens
    TeamAddress1 public teamAddress1 = new TeamAddress1();
    TeamAddress2 public teamAddress2 = new TeamAddress2();
    MarketingAddress public marketingAddress = new MarketingAddress();
    RetailersAddress public retailersAddress = new RetailersAddress();
    ReserveAddress public reserveAddress = new ReserveAddress();
    BountyAddress public bountyAddress = new BountyAddress();
      
    // How many token units a buyer gets per wei.
    uint256 public rate;

    // Amount of wei raised
    uint256 public weiRaised;

    event TokensPurchased(
      address indexed purchaser,
      address indexed beneficiary,
      uint256 value,
      uint256 amount
    );

    constructor() public {
        uint256 totalTokens = token.INITIAL_SUPPLY();
        /**
        * @dev Inicial distributing tokens to special adresses
        * TeamAddress1 - 4.5%
        * TeamAddress2 - 13.5% (hold one year)
        * MarketingAddress - 18%
        * RetailersAddress - 9%
        * ReserveAddress - 8%
        * BountyAddress - 1%
        */
        _deliverTokens(teamAddress1, totalTokens.mul(45).div(1000));
        _deliverTokens(teamAddress2, totalTokens.mul(135).div(1000));
        _deliverTokens(marketingAddress, totalTokens.mul(18).div(100));
        _deliverTokens(retailersAddress, totalTokens.mul(9).div(100));
        _deliverTokens(reserveAddress, totalTokens.mul(8).div(100));
        _deliverTokens(bountyAddress, totalTokens.div(100));

        rate = 1000;
    }

    // -----------------------------------------
    // Crowdsale external interface
    // -----------------------------------------

    /**
    * @dev fallback function ***DO NOT OVERRIDE***
    */
    function () external payable {
        _buyTokens(msg.sender);
    }

    /**
    * @dev low level token purchase ***DO NOT OVERRIDE***
    * @param _beneficiary Address performing the token purchase
    */
    function _buyTokens(address _beneficiary) internal {
        uint256 weiAmount = msg.value;
        _preValidatePurchase(_beneficiary, weiAmount);

        // calculate token amount to be created
        uint256 tokens = _getTokenAmount(weiAmount);

        // update state
        weiRaised = weiRaised.add(weiAmount);

        _processPurchase(_beneficiary, tokens);
        emit TokensPurchased(
            msg.sender,
            _beneficiary,
            weiAmount,
            tokens
        );

        _forwardFunds();
    }

    // -----------------------------------------
    // Internal interface (extensible)
    // -----------------------------------------

    /**
     * @dev called by the owner to pause, triggers stopped state
     */
    function pauseCrowdsale() public onlyOwner {
        token.pause();
    }

    /**
     * @dev called by the owner to unpause, returns to normal state
     */
    function unpauseCrowdsale() public onlyOwner {
        token.unpause();
    }

    /**
     * @dev the function tranfer tokens from TeamAddress1 to investor
     * @param _value is entered in whole tokens (1 = 1 token)
     */
    function transferTokensFromTeamAddress1(address _investor, uint256 _value) public onlyOwner returns(bool){
        uint256 value = _value;
        require (value >= 1,"Min value is 1");
        value = value.mul(1 ether);
        token.transferTokensFromSpecialAddress(address(teamAddress1), _investor, value); 
        return true;
    } 

    /**
     * @dev the function tranfer tokens from TeamAddress1 to investor
     * only after 1 year
     * @param _value is entered in whole tokens (1 = 1 token)
     */
    function transferTokensFromTeamAddress2(address _investor, uint256 _value) public onlyOwner returns(bool){
        uint256 value = _value;
        require (value >= 1,"Min value is 1");
        value = value.mul(1 ether);
        require (now >= crowdSaleEndTime + 365 days, "Only after 1 year");
        token.transferTokensFromSpecialAddress(address(teamAddress2), _investor, value); 
        return true;
    } 
    
    /**
     * @dev the function tranfer tokens from MarketingAddress to investor
     * @param _value is entered in whole tokens (1 = 1 token)
     */
    function transferTokensFromMarketingAddress(address _investor, uint256 _value) public onlyOwner returns(bool){
        uint256 value = _value;
        require (value >= 1,"Min value is 1");
        value = value.mul(1 ether);
        token.transferTokensFromSpecialAddress(address(marketingAddress), _investor, value); 
        return true;
    } 
    
    /**
     * @dev the function tranfer tokens from RetailersAddress to investor
     * @param _value is entered in whole tokens (1 = 1 token)
     */
    function transferTokensFromRetailersAddress(address _investor, uint256 _value) public onlyOwner returns(bool){
        uint256 value = _value;
        require (value >= 1,"Min value is 1");
        value = value.mul(1 ether);
        token.transferTokensFromSpecialAddress(address(retailersAddress), _investor, value); 
        return true;
    } 

    /**
     * @dev the function tranfer tokens from ReserveAddress to investor
     * @param _value is entered in whole tokens (1 = 1 token)
     */
    function transferTokensFromReserveAddress(address _investor, uint256 _value) public onlyOwner returns(bool){
        uint256 value = _value;
        require (value >= 1,"Min value is 1");
        value = value.mul(1 ether);
        token.transferTokensFromSpecialAddress(address(reserveAddress), _investor, value); 
        return true;
    } 

    /**
     * @dev the function tranfer tokens from BountyAddress to investor
     * @param _value is entered in whole tokens (1 = 1 token)
     */
    function transferTokensFromBountyAddress(address _investor, uint256 _value) public onlyOwner returns(bool){
        uint256 value = _value;
        require (value >= 1,"Min value is 1");
        value = value.mul(1 ether);
        token.transferTokensFromSpecialAddress(address(bountyAddress), _investor, value); 
        return true;
    } 
    
    /**
    * @dev Validation of an incoming purchase. 
    * @param _beneficiary Address performing the token purchase
    * @param _weiAmount Value in wei involved in the purchase
    * Start Crowdsale 20/09/2018       - 1537401600
    * Finish Crowdsale 14/12/2018      - 1544745600
    * Greate pause until 01/11/2020    - 1604188800
    */
    function _preValidatePurchase(address _beneficiary, uint256 _weiAmount) internal view{
        require(_beneficiary != address(0),"Invalid address");
        require(_weiAmount != 0,"Invalid amount");
        require((now > 1537401600 && now <=1544745600) || now > 1604188800,"At this time contract don`t sell tokens, sorry");
        require(weiRaised < hardCap,"HardCap is passed, contract don`t accept ether.");
    }

    /**
    * @dev internal function
    * @param _beneficiary Address performing the token purchase
    * @param _tokenAmount Number of tokens to be emitted
    */
    function _deliverTokens(address _beneficiary, uint256 _tokenAmount) internal {
        token.safeTransfer(_beneficiary, _tokenAmount);
    }


    /**
     * @dev Function transfer token to new investors
     */ 
    function transferToken(address _newInvestor, uint256 _tokenAmount) public onlyOwner {
        
        _deliverTokens(_newInvestor, _tokenAmount);
    }

    /**
    * @dev Executed when a purchase has been validated and is ready to be executed. Not necessarily emits/sends tokens.
    * @param _beneficiary Address receiving the tokens
    * @param _tokenAmount Number of tokens to be purchased
    */
    function _processPurchase(
        address _beneficiary,
        uint256 _tokenAmount
    )
      internal
    {
        _deliverTokens(_beneficiary, _tokenAmount);
    }


    /**
    * @dev this function is ether converted to tokens.
    * @param _weiAmount Value in wei to be converted into tokens
    * @return Number of tokens that can be purchased with the specified _weiAmount
    */
    function _getTokenAmount(uint256 _weiAmount) internal view returns (uint256) {
        uint256 bonus = 0;
        /**
        * Start PreSale      20/09/2018      - 1537401600
        * Start ICO          10/10/2018      - 1539129600     
        */
        if (now < 1539129600) {
            // Calculating bonus for PreSale period
            if (_weiAmount >= 100 * 1 ether) {
                bonus = 300;
            } else {
                bonus = 100;
            }
        } else {
            // Calculating bonus for ICO period
            if (_weiAmount >= 100 * 1 ether) {
                bonus = 200;
            } else {
            /**
            * ICO bonus                        UnisTimeStamp 
            *                                  Start date      End date
            * 10.10.2018-16.10.2018 - 40%      1539129600
            * 17.10.2018-23.10.2018 - 30%      1539734400
            * 24.10.2018-31.10.2018 - 20%      1540339200
            * 01.11.2018-16.11.2018 - 10%      1541030400      1542326400
            */
                if (now >= 1539129600 && now < 1539734400) {
                    bonus = 40;
                }
                if (now >= 1539734400 && now < 1540339200) {
                    bonus = 30;
                }
                if (now >= 1540339200 && now < 1541030400) {
                    bonus = 20;
                }
                if (now >= 1541030400 && now < 1542326400) {
                    bonus = 10;
                }
            }
            if (bonus > 0) {
                _weiAmount += _weiAmount.mul(bonus).div(100);
            }
        }
        return _weiAmount.mul(rate);
    }

    /**
    * @dev Determines how ETH is stored/forwarded on purchases.
    */
    function _forwardFunds() internal {
        uint256 transferValue = myAddress.balance.div(8);

        // Addresses where funds are collected
        address wallet1 = owner;
        address wallet2 = owner;
        address wallet3 = owner;
        address wallet4 = owner;
        address wallet5 = owner;
        address wallet6 = owner;
        address wallet7 = owner;
        address wallet8 = owner;
        
        wallet1.transfer(transferValue);
        wallet2.transfer(transferValue);
        wallet3.transfer(transferValue);
        wallet4.transfer(transferValue);
        wallet5.transfer(transferValue);
        wallet6.transfer(transferValue);
        wallet7.transfer(transferValue);
        wallet8.transfer(myAddress.balance);
    }
}
