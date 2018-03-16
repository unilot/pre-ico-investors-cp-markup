function Calculator() {
    this._setup();
    this.setTokenAmount(1, this.$tokenAmountEl);
}

Calculator.prototype = {
    $tokenAmountEl: $('.js-calculator-token-amount-input'),
    $cryptoAmountEl: $('.js-calculator-eth-amount-input'),
    $totalTokenContainerEl: $('.js-token-total-amount'),
    $tokenContainerEl: $('.js-token-amount'),
    $bonusTokenContainerEl: $('.js-token-bonus-amount'),
    $totalBonusContainerEl: $('.js-token-total-bonus'),
    $totalFiatContainerEl: $('.js-fiat-total-amount'),
    $tokenPriceEl: $('.js-token-price'),

    tokenAmount: 0,
    ethAmount: 0,
    minTokenValue: 0,
    maxTokenValue: 0,

    bonusTokenAmount: 1,
    bonusAmount: 0.4, //40%

    _getMinAmount: function($input) {
        return $input.attr('min') || this.minTokenValue;
    },

    _getMaxAmount: function($input) {
        return $input.attr('max') || this.maxTokenValue;
    },

    isValidTokenAmount: function(tokenAmount, $input){
        var _tokenAmount = tokenAmount;
        var minValue = this._getMinAmount($input);
        var maxValue = this._getMaxAmount($input);

        return !( isNaN(_tokenAmount)
            || _tokenAmount < minValue
            || ( maxValue > 0 && _tokenAmount > maxValue ) );
    },

    markAsError: function($input) {
        var $formGroup = $input.closest('.form-group');

        $formGroup.addClass('has-error');
        $('.help-block.with-errors', $formGroup).removeClass('hidden');

    },

    removeErrorMark: function($input) {
        var $formGroup = $input.closest('.form-group');

        $formGroup.removeClass('has-error');
        $('.help-block.with-errors', $formGroup).addClass('hidden');
    },

    setTokenAmount: function(amount, $input) {
        var _amount = parseInt(amount);
        var _self = this;
        var $inputEl = $input;

        if (!$inputEl) {
            $inputEl = this.$tokenAmountEl;
        }

        if ($inputEl.length > 1) {
            $inputEl.each(function(index, element){
                _self.setTokenAmount(_amount, $(element));
            });

            return true;
        }

        $inputEl.val(_amount);
        this.tokenAmount = _amount;

        var tokenTotalAmount = 0,
            tokenAmount = 0,
            bonusAmount = 0;

        if ( !this.isValidTokenAmount(_amount, $inputEl) ) {
            this.markAsError($inputEl);
            _amount = 0;
        } else {
            this.removeErrorMark($inputEl);

            tokenTotalAmount = this.getTokenTotalAmount();
            tokenAmount = this.getTokenAmount();
            bonusAmount = this.getTokenBonusAmount();
        }

        $inputEl.closest('form').find(this.$totalBonusContainerEl).text(this.getBonus());
        $inputEl.closest('form').find(this.$totalTokenContainerEl).text(tokenTotalAmount);
        $inputEl.closest('form').find(this.$tokenContainerEl).text(tokenAmount);
        $inputEl.closest('form').find(this.$bonusTokenContainerEl).text(bonusAmount);

        $inputEl.trigger('calculator.token.change', [_amount]);

        return true;
    },

    _setup: function () {
        this.$tokenAmountEl.off('input', this.events().tokenAmountChanged);
        this.$cryptoAmountEl.off('input', this.events().ethAmountChanged);

        $('.js-value-up', this.$tokenAmountEl.closest('.input-group'))
            .off('click', this.events().incrementTokenAmount);
        $('.js-value-down', this.$tokenAmountEl.closest('.input-group'))
            .off('click', this.events().decreaseTokenAmount);

        this.$tokenAmountEl.on('input', this.events().tokenAmountChanged);
        this.$cryptoAmountEl.on('input', this.events().ethAmountChanged);

        $('.js-value-up', this.$tokenAmountEl.closest('.input-group'))
            .on('click', this.events().incrementTokenAmount);
        $('.js-value-down', this.$tokenAmountEl.closest('.input-group'))
            .on('click', this.events().decreaseTokenAmount);

        this.$tokenAmountEl.on('calculator.token.change', this.events().calculateCryptoAmount);

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

        getBonus: function() {
        var result = 0;

        if ( this._hasBonus() ) {
            result = parseFloat((this.bonusAmount * 100).toFixed(2));
        }

        return result;
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

    _calculateFiat: function ($coinEl, cryptoAmount) {
        var fiatExchange = $coinEl.data('fiat');

        var accuracy = Math.pow(10,6);
        var fiatAmount = ( Math.round( ( cryptoAmount * fiatExchange ) * accuracy ) / accuracy );

        var $formGroup = $coinEl.closest('.form-group');
        var $form = $coinEl.closest('form');

        if ( fiatExchange ) {
            if ( $formGroup.length > 0 && $formGroup.find(this.$totalFiatContainerEl).length > 0 ) {
                $formGroup.find(this.$totalFiatContainerEl).text( fiatAmount );
            } else if ( $form.length > 0 && $form.find(this.$totalFiatContainerEl).length > 0 ) {
                $form.find(this.$totalFiatContainerEl).text( fiatAmount );
            }
        }
    },

    events: function() {
        var _self = this;

        return {
            tokenAmountChanged: function(e) {
                var $this = $(e.target);
                _self.setTokenAmount(parseInt($this.val()));
            },

            ethAmountChanged: function(e) {
                var $el = $(e.target);

                var tokenPrice = $el.data('price');

                var tokenAmount = Math.floor(parseFloat($el.val())/tokenPrice);

                $el.data('clsource', true);

                _self.setTokenAmount(tokenAmount);
            },

            incrementTokenAmount: function(e) {
                var amount = _self.tokenAmount;

                if ( isNaN(amount) ) {
                    amount = 0;
                }

                _self.setTokenAmount(amount + 1);
            },

            decreaseTokenAmount: function (e) {
                var amount = _self.tokenAmount;

                if ( isNaN(amount) ) {
                    amount = 0;
                }

                var minAmount = _self._getMinAmount($('input', $(e.target).closest('.input-group')));

                if ( minAmount < amount ) {
                    _self.setTokenAmount(amount - 1);
                }
            },

            calculateCryptoAmount: function (e, tokenAmount) {
                var $form = $(e.target).closest('form');

                $form.find(_self.$cryptoAmountEl).each(function(index, element) {
                    var $el = $(element);
                    var tokenPrice = $el.data('price');


                    var cryptoAmount = Math.round(
                            (parseFloat(tokenPrice) * tokenAmount) * Math.pow(10, 12)
                        ) / Math.pow(10, 12);

                    if (!$el.data('clsource')) {
                        $el.val(cryptoAmount);
                    } else {
                        cryptoAmount = parseFloat($el.val());
                        $el.data('clsource', false);
                    }

                    _self._calculateFiat($el, cryptoAmount);
                });
            }
        };
    }
};
