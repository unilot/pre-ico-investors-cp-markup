(function(){
    var form2Data = function($form) {
        var result = {};

        $.map($form.serializeArray(), function(n, i) {
            result[n['name']] = n['value'];
        });

        return result;
    };

    var onlineFormProcessor = function($forms, formSettings) {
        var showAlertMessage = function($form, type, message) {
            var $alert = $('.js-form-alert', $form);

            $alert.removeClass('hidden');

            if ( type !== 'success' ) $alert.removeClass('alert-success');
            if ( type !== 'warning' ) $alert.removeClass('alert-warning');
            if ( type !== 'danger' ) $alert.removeClass('alert-danger');

            $alert.addClass('alert-' + type);

            $alert.text(message);
        };

        var hideAlert = function($form) {
            var $alert = $('.js-form-alert', $form);

            $alert.removeClass('alert-success');
            $alert.removeClass('alert-warning');
            $alert.removeClass('alert-danger');
            $alert.addClass('hidden');
            $alert.text('');
        };

        var defaultSettings = {
            beforeSend: function($form, jqXHR, settings) {
                hideAlert($form);
            },
            fail: function($form, jqXHR, textStatus, errorThrown) {
                var message = jqXHR.responseText;

                try {
                    message = JSON.parse(jqXHR.responseText);

                    if (message.hasOwnProperty('detail') ) {
                        message = message.detail;
                    }

                    if ( jqXHR.status === 400 ) {
                        return true;
                    }
                } catch (e) {/*Do nothing*/}


                if ( message && message.length > 384 ) {
                    message = message.substr(0, 384) + '...';
                }

                showAlertMessage($form, 'danger', message);

                return true;
            },
            valid: function($form) {
                if ($form.data('url')) {
                    window.location.replace($form.data('url'))
                } else {
                    showAlertMessage($form, 'success', $form.data('success-message'));
                }
            },
            badRequest: function($form, jqXHR, textStatus, errorThrown) {
                //Do nothing
            }
        };

        var formFinalSettings = $.extend(defaultSettings, formSettings);

        $forms.validator({
            custom: {
                wallet: function($input) {
                    if ( $input.val().length > 0 && !(new Web3()).isAddress($input.val()) ) {
                        var error = config.messages.errors.validation.invalidWallet;

                        if ($input.data('wallet-error')) {
                            error = $input.data('wallet-error');
                        } else if ( $input.data('error') ) {
                            error = $input.data('error');
                        }

                        return error;
                    }
                },
                online: function($input) {
                    var url = $input.data('online');
                    var $form = $input.closest('form');
                    var validator = $form.data('bs.validator');
                    var data = {};

                    if ( $input.val().trim().length === 0 ) {
                        return false;
                    }

                    data[$input.attr('name')] = $input.val();

                    //TODO a lot of code duplication. This part should probably be refactored
                    if (validator && ($input.data('bs.validator.errors') || []).length === 0) {
                        $.ajax({
                            url: url,
                            dataType: 'json',
                            method: 'OPTIONS',
                            xhrFields: {
                                withCredentials: true
                            },
                            headers: {
                                'X-CSRFToken': Cookies.get('csrftoken')
                            },
                            success: function () {
                                $.ajax({
                                    url: url,
                                    dataType: 'json',
                                    data: data,
                                    method: 'POST',
                                    xhrFields: {
                                        withCredentials: true
                                    },
                                    headers: {
                                        'X-CSRFToken': Cookies.get('csrftoken')
                                    },
                                    statusCode: {
                                        400: function (jqXHR, textStatus, errorThrown) {
                                            var errors = $input.data('bs.validator.errors');
                                            try {
                                                var resposneData = JSON.parse(jqXHR.responseText);
                                                errors.push(resposneData[$input.attr('name')]);
                                            } catch (e) {
                                                errors.push(jqXHR.responseText || textStatus);
                                            }

                                            $input.data('bs.validator.errors', errors);
                                            validator.showErrors($input);
                                        }
                                    },
                                    error: function (jqXHR, textStatus, errorThrown) {
                                        if (jqXHR.status === 400)
                                            return true;

                                        var error = config.messages.errors.validation.requestFailed;

                                        $input.data('bs.validator.errors', [error]);
                                        validator.showErrors($input);
                                    }
                                });
                            },
                            error: function (jqXHR, textStatus, errorThrown) {
                                var error = config.messages.errors.validation.requestFailed;

                                $input.data('bs.validator.errors', [error]);
                                validator.showErrors($input);
                            }
                        });
                    }
                },
                phone: function($input) {
                    var phoneUtil = libphonenumber.PhoneNumberUtil.getInstance();
                    var $form = $input.closest('form');
                    var validator = $form.data('bs.validator');

                    try {
                        var phone = phoneUtil.parse($input.val());

                        if ( !phoneUtil.isValidNumber(phone) ) {
                            throw new Error();
                        }

                    } catch (exception) {
                        return config.messages.errors.validation.invalidPhone;
                    }
                }
            }
        }).on('submit', function(event) {
            if ( event.isDefaultPrevented() ) {
                return false;
            }

            var _self = this;
            var $form = $(_self);
            var hasOverlay = false;
            var $overlayedBlock = null;
            var $overlay = null;

            if ( ( $overlayedBlock = $form.hasClass('js-has-overlay') ) ) {
                hasOverlay = true;
            } else if ( ( $overlayedBlock = $form.closest('.js-has-overlay') ).length > 0 ) {
                hasOverlay = true;
            }

            $overlay = $('.block-overlay', $overlayedBlock);

            if ( hasOverlay ) {
                $overlay.removeClass('hidden');
            }

            var data = form2Data($form);
            event.preventDefault();

            $.ajax({
                url: $form.prop('action'),
                dataType: 'json',
                method: 'OPTIONS',
                xhrFields: {
                    withCredentials: true
                },
                headers: {
                    'X-CSRFToken': Cookies.get('csrftoken')
                },
                success: function() {
                    $.ajax({
                        url: $form.prop('action'),
                        dataType: 'json',
                        data: data,
                        method: $form.attr('method'),
                        xhrFields: {
                            withCredentials: true
                        },
                        headers: {
                            'X-CSRFToken': Cookies.get('csrftoken')
                        },
                        statusCode: {
                            403: function (jqXHR, testStatus, errorThrown) {
                                window.location.reload();
                            },
                            400: function(jqXHR, textStatus, errorThrown) {
                                try {
                                    $.each(JSON.parse(jqXHR.responseText), function(fieldName, errors) {
                                        var $input = $('[name="' + fieldName + '"]', $form);

                                        $input.data('bs.validator.errors', errors);
                                        $form.data('bs.validator').showErrors($input);
                                    });

                                    formFinalSettings.badRequest($form, jqXHR, textStatus, errorThrown);
                                } catch (e) {
                                    formFinalSettings.fail($form, jqXHR, textStatus, errorThrown);
                                }

                            }
                        },
                        error: function(jqXHR, textStatus, errorThrown) {
                            formFinalSettings.fail($form, jqXHR, textStatus, errorThrown);
                        },
                        complete: function() {
                            if (hasOverlay) {
                                $overlay.addClass('hidden');
                            }
                        },
                        success: function () {
                            formFinalSettings.valid($form);
                        }
                    });
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    if ( hasOverlay ) {
                        $overlay.addClass('hidden');
                    }

                    formFinalSettings.fail($form, jqXHR, textStatus, errorThrown);
                },
                beforeSend: function(jqXHR, settings) {
                    formFinalSettings.beforeSend($form, jqXHR, settings)
                }
            });

            return false;
        });
    };

    var $forms = $('form.js-generic-form');
    var $signUpForm = $('#signUpForm');

    onlineFormProcessor($forms);
    onlineFormProcessor($signUpForm, {
        badRequest: function($form, jqXHR, textStatus, errorThrown) {
            var $termsAndConditionsModal = $('#termsAndConditions');
            var $modalFormGroupsWithErrors = $('.form-group.has-error', $termsAndConditionsModal);

            if ( $modalFormGroupsWithErrors.length === 0 ) {
                $termsAndConditionsModal.modal('hide');
            }
        }
    });
})();