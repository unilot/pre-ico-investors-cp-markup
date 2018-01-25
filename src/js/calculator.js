function Calculator(untAmountInputEl, ethAmountInputEl, fiatExchangeRate) {
    this.tokenAmountEl = untAmountInputEl;
    this.ethAmountEl = ethAmountInputEl;
    this.setFiatExchangeRate(fiatExchangeRate);

    this.setTokenAmount(parseInt(this.tokenAmountEl.val()));

    this._setup();
}

Calculator.prototype = {
    tokenAmountEl: null,
    ethAmountEl: null,
    totalTokenContainerEl: $('.js-token-total-amount'),
    tokenContainerEl: $('.js-token-amount'),
    bonusTokenContainerEl: $('.js-token-bonus-amount'),
    totalEthContainerEl: $('.js-eth-total-amount'),
    totalBonusContainerEl: $('.js-token-total-bonus'),
    totalFiatContainerEl: $('.js-fiat-total-amount'),
    tokenPriceEl: $('.js-token-price'),

    tokenAmount: 0,
    ethAmount: 0,
    tokenPrice: parseFloat((0.5/200).toFixed(6)),
    fiatExchangeRate: 0,
    minTokenValue: 0,
    maxTokenValue: 10000,

    bonusTokenAmount: 1,
    bonusAmount: 0.4, //40%

    calculateEthAmount: function (tokenAmount) {
        return ( ( tokenAmount || this.tokenAmount )  * this.tokenPrice);
    },

    calculateTokenAmount: function(ethAmount) {
        return Math.floor( ( ethAmount || this.ethAmount ) / this.tokenPrice);
    },

    isValidTokenAmount: function(tokenAmount){
        var _tokenAmount = tokenAmount || this.tokenAmount;

        return !( isNaN(_tokenAmount)
            || _tokenAmount < this.minTokenValue
            || _tokenAmount > this.maxTokenValue );
    },

    setTokenAmount: function(amount) {
        var _amount = parseInt(amount);

        if ( !this.isValidTokenAmount(_amount) ) {
            this.tokenAmountEl.closest('.form-group').addClass('has-error');
        } else {
            this.tokenAmountEl.closest('.form-group').removeClass('has-error');
            this.tokenAmount = _amount;

            this.ethAmount = parseFloat(this.calculateEthAmount().toFixed(6));
            var value = this.ethAmount;

            this.ethAmountEl.val(value);
            this.totalBonusContainerEl.text(this.getBonus());
            this.totalTokenContainerEl.text(this.getTokenTotalAmount());
            this.tokenContainerEl.text(this.getTokenAmount());
            this.bonusTokenContainerEl.text(this.getTokenBonusAmount());
            this.totalEthContainerEl.text(this.ethAmount);
            this.totalFiatContainerEl.text(this.getFiatAmount());
        }

        this.tokenAmountEl.val(this.tokenAmount);
    },

    setEthAmount: function(amount) {
        var _amount = parseFloat(amount);

        if ( isNaN(_amount) ) {
            this.ethAmountEl.closest('.form-group').addClass('has-error');
        } else if ( !this.isValidTokenAmount(this.calculateTokenAmount(_amount)) ) {
            this.tokenAmountEl.closest('.form-group').addClass('has-error');
            this.ethAmountEl.closest('.form-group').addClass('has-error');
        }  else {
            this.tokenAmountEl.closest('.form-group').removeClass('has-error');
            this.ethAmountEl.closest('.form-group').removeClass('has-error');

            this.ethAmount = _amount;
            this.tokenAmount = this.calculateTokenAmount();

            this.tokenAmountEl.val(this.tokenAmount);
            this.ethAmountEl.val(amount);
            this.totalBonusContainerEl.text(this.getBonus());
            this.totalTokenContainerEl.text(this.getTokenTotalAmount());
            this.totalEthContainerEl.text(this.ethAmount);
            this.totalFiatContainerEl.text(this.getFiatAmount());
        }
    },
    
    _fixTokenAmount: function() {
        if ( isNaN(this.tokenAmount) || this.tokenAmount <= this.minTokenValue ) {
            this.setTokenAmount(this.minTokenValue);
        } else if ( this.tokenAmount >= this.maxTokenValue ) {
            this.setTokenAmount(this.maxTokenValue);
        }
    },

    _setup: function () {
        this.tokenAmountEl.off('input', this.events().tokenAmountChanged);
        this.ethAmountEl.off('input', this.events().ethAmountChanged);

        $('.js-value-up', this.tokenAmountEl.closest('.input-group'))
            .off('click', this.events().incrementTokenAmount);
        $('.js-value-down', this.tokenAmountEl.closest('.input-group'))
            .off('click', this.events().decreaseTokenAmount);

        this.tokenAmountEl.on('input', this.events().tokenAmountChanged);
        this.ethAmountEl.on('input', this.events().ethAmountChanged);

        $('.js-value-up', this.tokenAmountEl.closest('.input-group'))
            .on('click', this.events().incrementTokenAmount);
        $('.js-value-down', this.tokenAmountEl.closest('.input-group'))
            .on('click', this.events().decreaseTokenAmount);

        this.setTokenPrice(this.tokenPrice);
    },

    _hasBonus: function () {
        return ( this.tokenAmount >= this.bonusTokenAmount );
    },

    getTokenAmount: function() {
        return this.tokenAmount;
    },

    getTokenBonusAmount: function() {
        return Math.floor(this.getTokenAmount() * this.bonusAmount)
    },

    getTokenTotalAmount: function() {
        var result = this.tokenAmount;

        if ( this._hasBonus() ) {
            result = this.getTokenAmount() + this.getTokenBonusAmount();
        }

        return result;
    },

    getFiatAmount: function() {
        if ( this.fiatExchangeRate <= 0 ) {
            return null;
        }

        return Math.floor( this.ethAmount * this.fiatExchangeRate * 100 ) / 100;
    },

    getBonus: function() {
        var result = 0;

        if ( this._hasBonus() ) {
            result = parseFloat((this.bonusAmount * 100).toFixed(2));
        }

        return result;
    },

    setFiatExchangeRate: function(exchangeRate) {
        var _exchangeRate = parseFloat(exchangeRate);

        if ( !isNaN(_exchangeRate) ) {
            this.fiatExchangeRate = _exchangeRate;
        }
    },

    setTokenPrice: function(tokenPrice) {
        var _tokenPrice = parseFloat(tokenPrice);

        if ( !isNaN(_tokenPrice) && _tokenPrice > 0 ) {
            this.tokenPrice = _tokenPrice;
            this.tokenPriceEl.text(this.tokenPrice + ' ETH');
            this.setTokenAmount(this.tokenAmount);
        }
    },

    setBonusAmount: function(bonusAmount) {
        var _bonusAmount = parseFloat(bonusAmount);

        if ( !isNaN(_bonusAmount) && _bonusAmount >= 0 ) {
            this.bonusAmount = _bonusAmount;
        }
    },

    setMinTokenAmount: function(minTokenAmount) {
        var _minTokenAmount = parseInt(minTokenAmount);

        if ( !isNaN(_minTokenAmount) && _minTokenAmount >= 0 ) {
            this.minTokenValue = _minTokenAmount;
        }
    },

    setMaxTokenAmount: function(maxTokenAmount) {
        var _maxTokenAmount = parseInt(maxTokenAmount);

        if ( !isNaN(_maxTokenAmount) && _maxTokenAmount > 0 ) {
            this.maxTokenValue = _maxTokenAmount;
        }
    },

    events: function() {
        _self = this;

        return {
            tokenAmountChanged: function() {
                _self.setTokenAmount(parseInt($(this).val()));
            },

            ethAmountChanged: function(event) {
                _self.setEthAmount($(this).val());
            },

            incrementTokenAmount: function() {
                if ( _self.isValidTokenAmount() ) {
                    if ( _self.tokenAmount < _self.maxTokenValue ) {
                        _self.setTokenAmount(_self.tokenAmount + 1);
                    }
                } else {
                    _self._fixTokenAmount();
                }
            },

            decreaseTokenAmount: function () {
                if ( _self.isValidTokenAmount() ) {
                    if ( _self.tokenAmount > _self.minTokenValue ) {
                        _self.setTokenAmount(_self.tokenAmount - 1);
                    }
                } else {
                    _self._fixTokenAmount();
                }
            }
        };
    }
};
