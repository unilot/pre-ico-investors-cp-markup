(function(){
    var url = document.location.toString();

    //Calculator
    var $referralLinkCopyButton = $('.js-copy-referral-link');
    var $buyCopyTokensContractNumber = $('.js-buy-tokens-copy-contract-number');
    var $myWalletCopy = $('.js-my-wallet-copy');
    var $timeCounterBlock = $('.js-time-counter');
    var $signUpWizard = $('#signupWizard');
    var $icoProgressBars = $('.ico-sale-progress');
    var $ethRaisedContainer = $('.eth-raised-container');
    var $copyAddressButton = $('.js-copy-address');

    var calculator = new Calculator();
    var isReferralLinkCopyButtonPopoverShown = false;

    calculator.setBonusAmount(config.token.bonus);
    calculator.setMinTokenAmount(config.token.minTokenAmount);
    calculator.setMaxTokenAmount(config.token.maxTokenAmount);

    $icoProgressBars.width((config.token.saleProgress * 100) + '%');

    //Filling all containers with ether info
    $ethRaisedContainer.text(config.token.saleAmount + ' ETH');

    $('.js-submit').on('click', function(event){
        $(this).closest('form').submit();

        return false;
    });

    //Timer
    var counterTmpl = $.templates('#jsTimeCounterTemplate');
    var milestone = moment.tz('2018-03-22 19:00', 'UTC');

    $timeCounterBlock.countdown(milestone.toDate(), function(event){
        $(this).html(event.strftime(counterTmpl.render()));
    });

    $referralLinkCopyButton.popover({delay: {hide: 1000}});
    $buyCopyTokensContractNumber.popover({delay: {hide: 1000}});
    $myWalletCopy.popover({delay: {hide: 1000}});
    $copyAddressButton.popover({delay: {hide: 1000}});

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

    $myWalletCopy.on('show.bs.popover', function(event) {
        var $input = $('#wallet');

        $input.select();
        document.execCommand('copy');
    });

    $copyAddressButton.on('show.bs.popover', function(event) {
        var $input = $($('js-copy-input', $(event.target).closest('form')).get(0));

        $input.select();
        document.execCommand('copy');
    });

    // Wizard
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

    // Slideout
    // initialize slideout
    var slideout = new Slideout({
        'panel': document.getElementById('main-body'),
        'menu': document.getElementById('slideout'),
        'padding': 256,
        'tolerance': 70
    });

    // initialize toggle button
    document.querySelector('.toggle-menu').addEventListener('click', function() {
        slideout.toggle();
    });

    // set overlay to close slideout menu on click
    function close(eve) {
        eve.preventDefault();
        slideout.close();
    }

    slideout
        .on('beforeopen', function() {
            this.panel.classList.add('panel-open');
        })
        .on('open', function() {
            this.panel.addEventListener('click', close);
        })
        .on('beforeclose', function() {
            this.panel.classList.remove('panel-open');
            this.panel.removeEventListener('click', close);
        });

    // Material design
    $.material.init();



    // Modals: ensure that body element has .modal-open class to avoid background
    // scrolling after one modal is closed and second is opened.

    // #buyUnitTokens modal appears when 'Confirm' button in #sourceWallet modal
    // is clicked. The same button dismisses the #sourceWallet, thus causing a mix-up
    // between fired events and their consequences. The class .modal-open is added to
    // body element with the appearance of #buyUnitTokens, but is removed right away
    // with dismissal of #sourceWallet. Therefore, this workaround comes to play. It
    // utilises focusin.bs.modal event instead of show.bs.modal, since the latter is
    // tangled within this confusion.
    $('#buyUnitTokens').on('focusin.bs.modal', function(){
        $(document.body).delay(800).addClass('modal-open');
    });


    //Select wallet
    var $walletAppSourceSelect = $('#sourceWalletWalletApp');

    if ($walletAppSourceSelect.length > 0) {
        var onWalletSelected = function(e) {
            var _self = $(this);
            var $walletInput = $('#sourceWalletWallet');

            if (_self.val()) {
                $walletInput.removeAttr('disabled');
            }
        };

        $walletAppSourceSelect.change(onWalletSelected);

        if ( $walletAppSourceSelect.val() ) {
            $walletAppSourceSelect.trigger('change');
        }
    }

    //Close destroy button
    $(document).click('.js-close-destroy-block', function(e) {
        var $_self = $(e.target);

        //Fix for chrome that may return child element as target instead of target one
        if (!$_self.hasClass('js-close-destroy-block')) {
            $_self = $_self.closest('.js-close-destroy-block');
        }

        if ( $_self.data('target') ) {
            $_self.closest($_self.data('target')).remove();
        }

    });
})();