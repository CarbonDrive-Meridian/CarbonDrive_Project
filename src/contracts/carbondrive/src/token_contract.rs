// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Stellar Soroban Contracts ^0.4.1
#![no_std]

use soroban_sdk::{Address, contract, contractimpl, Env, String};
use stellar_access::ownable::{self as ownable, Ownable};
use stellar_macros::{default_impl, only_owner};
use stellar_tokens::fungible::{Base, burnable::FungibleBurnable, FungibleToken};

#[contract]
pub struct CarbonDrive;

#[contractimpl]
impl CarbonDrive {
    pub fn __constructor(e: &Env, owner: Address) {
        Base::set_metadata(e, 18, String::from_str(e, "Carbon Drive"), String::from_str(e, "CDRIVE"));
        ownable::set_owner(e, &owner);
    }

    #[only_owner]
    pub fn mint(e: &Env, account: Address, amount: i128) {
        Base::mint(e, &account, amount);
    }
}

#[default_impl]
#[contractimpl]
impl FungibleToken for CarbonDrive {
    type ContractType = Base;

}

//
// Extensions
//

#[default_impl]
#[contractimpl]
impl FungibleBurnable for CarbonDrive {}

//
// Utils
//

#[default_impl]
#[contractimpl]
impl Ownable for CarbonDrive {}
