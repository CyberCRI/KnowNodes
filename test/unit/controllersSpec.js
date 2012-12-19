/**
 * Created with JetBrains WebStorm.
 * User: admin
 * Date: 15/11/12
 * Time: 16:38
 * To change this template use File | Settings | File Templates.
 */
'use strict';

/* jasmine specs for controllers go here */
describe('PhoneCat controllers', function() {

    describe('PhoneListCtrl', function(){

        it('should create "phones" model with 3 phones', function() {
            var scope = {},
                ctrl = new PhoneListCtrl(scope);

            expect(scope.phones.length).toBe(3);
        });
    });
});