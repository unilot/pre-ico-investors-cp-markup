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
                        var error = config.messages.errors.invalidWallet;

                        if ($input.data('wallet-error')) {
                            error = $input.data('wallet-error');
                        } else if ( $input.data('error') ) {
                            error = $input.data('error');
                        }

                        return error;
                    }
                }
            }
        }).on('submit', function(event) {
            if ( event.isDefaultPrevented() ) {
                return false;
            }

            var $form = $(this);
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

            var optionsResponse = $.ajax({
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
                                        var $formGroup = $('[name="' + fieldName + '"]', $form).closest('.form-group');

                                        $formGroup.addClass('has-error');
                                        $formGroup.addClass('has-danger');

                                        var $errorBlock = $('.help-block.with-errors', $formGroup);

                                        var $list = $('ul', $errorBlock);

                                        if ( $list.length === 0 ) {
                                            $list = $('<ul class="list-unstyled">');
                                            $errorBlock.append($list);
                                        }

                                        $('li.js-request-validation', $list).remove();

                                        for (var i in errors) {
                                            if ( !errors.hasOwnProperty(i) ){
                                                continue;
                                            }

                                            var error = errors[i];
                                            $list.append($('<li class="js-request-validation">').text(error));
                                        }
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