(function(){
    var url = document.location.toString();

    //Calculator
    var $UNTAmountInput = $('.js-calculator-token-amount-input');
    var $etherAmountInput = $('.js-calculator-eth-amount-input');
    var $referralLinkCopyButton = $('.js-copy-referral-link');
    var $buyCopyTokensContractNumber = $('.js-buy-tokens-copy-contract-number');
    var $timeCounterBlock = $('#js-time-counter');
    var $signUpWizard = $('#signupWizard');
    var $icoProgressBars = $('.ico-sale-progress');
    var $ethRaisedContainer = $('.eth-raised-container');

    var calculator = new Calculator($UNTAmountInput, $etherAmountInput, config.token.price);
    var isReferralLinkCopyButtonPopoverShown = false;

    calculator.setFiatExchangeRate(config.eth.fiatExchangeRate);
    calculator.setBonusAmount(config.token.bonus);
    calculator.setMinTokenAmount(config.token.minTokenAmount);
    calculator.setMaxTokenAmount(config.token.maxTokenAmount);
    calculator.setTokenPrice(config.token.price);

    $icoProgressBars.width((config.token.saleProgress * 100) + '%');

    //Filling all containers with ether info
    $ethRaisedContainer.text(config.token.saleAmount + ' ETH');

    $('.js-submit').on('click', function(event){
        $(this).closest('form').submit();

        return false;
    });

    //Timer
    var counterTmpl = $.templates('#timeCounterTemplate');

    var milestone = moment.tz('2018-02-17 19:00', 'UTC');

    $timeCounterBlock.countdown(milestone.toDate(), function(event){
        $(this).html(event.strftime(counterTmpl.render()));
    });

    $referralLinkCopyButton.popover({delay: {hide: 1000}});
    $buyCopyTokensContractNumber.popover({delay: {hide: 1000}});

    $referralLinkCopyButton.on('show.bs.popover', function(event) {
        var $input = $('#referralLink');

        $input.select();
        document.execCommand('copy');
    });

    $buyCopyTokensContractNumber.on('show.bs.popover', function(event) {
        var $input = $('#tokenBuyContractNumber');

        $input.select();
        document.execCommand('copy');
    });

    $signUpWizard.bootstrapWizard();

    $('a[data-toggle=tab]', $signUpWizard).on("click", function (e) {
        if ($(e.target).closest('li').hasClass("disabled")) {
            e.preventDefault();
            return false;
        }
    });

    $('.js-wizard-next-step').on('click', function(e) {
        var self = $(e.target);
        var validator = $signUpWizard.closest('form').data('bs.validator');
        var nextTab = $signUpWizard.bootstrapWizard('currentIndex') + 1;

        var GoToNextStep = function () {
            $signUpWizard.bootstrapWizard('enable', nextTab);
            $signUpWizard.bootstrapWizard('next', nextTab);
        };

        var $input = $('input, select', $signUpWizard);

        if ( validator ) {
            $.each($input, function(index, input) {
                validator.clearErrors($(input));
            });
        }

        var $inputs = $('input, select', self.closest('.tab-pane'));

        if ( $inputs.length > 0 ) {
            $.when($inputs.map(function(){
                var $field = $(this);

                return validator.validateInput($field, false);
            })).then(function(a) {
                if ( validator.hasErrors() ) {
                    validator.focusError();
                } else {
                    GoToNextStep();
                }
            });
        } else {
            GoToNextStep();
        }

        return false;
    });

    $('.js-wizard-back').on('click', function () {
        $signUpWizard.bootstrapWizard('back');
    });

    $signUpWizard.closest('form').on('submit', function() {
        var validator = $(this).data('bs.validator');
        var $input = $('input, select', $('.tab-content .tab-pane:not(.active)', $signUpWizard));

        if ( validator ) {
            $.each($input, function(index, input) {
                validator.clearErrors($(input));
            });
        }

        return false;
    });

    $('.popover-trigger').popover();

    if ( url.match('#') ) {
        var hash = url.split('#')[1];

        $('#questions .panel-collapse.in').removeClass('in');
        $('#'+hash).addClass('in');
    }
})();