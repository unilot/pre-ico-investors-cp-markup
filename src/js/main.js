(function(){
    //Calculator
    var $UNTAmountInput = $('.js-calculator-token-amount-input');
    var $etherAmountInput = $('.js-calculator-eth-amount-input');
    var $referralLinkCopyButton = $('.js-copy-referral-link');
    var $buyCopyTokensContractNumber = $('.js-buy-tokens-copy-contract-number');
    var $timeCounterBlock = $('#js-time-counter');
    var $signUpWizard = $('#signupWizard');

    var calculator = new Calculator($UNTAmountInput, $etherAmountInput, 536.700000);
    var isReferralLinkCopyButtonPopoverShown = false;
    var web3 = new Web3();

    $('.js-submit').on('click', function(event){
        $(this).closest('form').submit();

        return false;
    });

    //Timer
    var counterTmpl = $.templates('#timeCounterTemplate');

    $timeCounterBlock.countdown('01/11/2018', function(event){
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

    // web3.setProvider(new web3.providers.HttpProvider(
    //     config.web3.schema + '://' + config.web3.host + ':' + config.web3.port
    // ));

    $signUpWizard.bootstrapWizard({'tabClass': 'nav nav-tabs'});

    $('.js-wizard-next-step').on('click', function() {
        var self = $(this);
        var $stepBody = self.closest('.tab-pane');
        var validator = $stepBody.closest('form').data('bs.validator');
        var nextTab = parseInt($stepBody.attr('tabindex')) + 1;

        var GoToNextStep = function () {
            $signUpWizard.bootstrapWizard('enable', nextTab);
            $signUpWizard.bootstrapWizard('next', nextTab);
        };

        var $inputs = $('input, select', $stepBody);

        if ( $inputs.length > 0 ) {
            $.when($inputs.map(function(el){
                return validator.validateInput($(this), false);
            })).then(function() {
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
})();