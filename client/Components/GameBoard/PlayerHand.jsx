import React from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';
import $ from 'jquery';

import Card from './Card';
import { tryParseJSON } from '../../util';

class PlayerHand extends React.Component {
    onDragOver(event) {
        $(event.target).addClass('highlight-panel');
        event.preventDefault();
    }

    onDragLeave(event) {
        $(event.target).removeClass('highlight-panel');
    }

    onDragDrop(event, target) {
        event.stopPropagation();
        event.preventDefault();

        $(event.target).removeClass('highlight-panel');

        let card = event.dataTransfer.getData('Text');

        if(!card) {
            return;
        }

        let dragData = tryParseJSON(card);
        if(!dragData) {
            return;
        }

        if(this.props.onDragDrop) {
            this.props.onDragDrop(dragData.card, dragData.source, target);
        }
    }

    disableMouseOver(revealWhenHiddenTo) {
        if(this.props.spectating && this.props.showHand) {
            return false;
        }

        if(revealWhenHiddenTo === this.props.username) {
            return false;
        }

        return !this.props.isMe;
    }

    getCards(needsSquish) {
        let cards = this.props.cards;
        let cardIndex = 0;
        let handLength = cards ? cards.length : 0;
        let cardWidth = this.getCardWidth();

        let requiredWidth = handLength * cardWidth;
        let overflow = requiredWidth - (cardWidth * 5);
        let offset = overflow / (handLength - 1);

        if(!this.props.isMe) {
            cards = _.sortBy(this.props.cards, card => card.revealWhenHiddenTo);
        }

        let hand = _.map(cards, card => {
            let left = (cardWidth - offset) * cardIndex++;

            let style = {};
            if(needsSquish) {
                style = {
                    left: left + 'px'
                };
            }

            return (<Card key={ card.uuid } card={ card } style={ style } disableMouseOver={ this.disableMouseOver(card.revealWhenHiddenTo) } source='hand'
                onMouseOver={ this.props.onMouseOver }
                onMouseOut={ this.props.onMouseOut }
                onClick={ this.props.onCardClick }
                onDragDrop={ this.props.onDragDrop }
                size={ this.props.cardSize } />);
        });

        return hand;
    }

    getCardWidth() {
        switch(this.props.cardSize) {
            case 'small':
                return 65 * 0.8;
            case 'large':
                return 65 * 1.4;
            case 'x-large':
                return 65 * 2;
            case 'normal':
            default:
                return 65;
        }
    }

    render() {
        let className = 'panel hand';

        if(this.props.cardSize !== 'normal') {
            className += ' ' + this.props.cardSize;
        }

        let cardWidth = this.getCardWidth();

        let needsSquish = this.props.cards && this.props.cards.length * cardWidth > (cardWidth * 5);

        if(needsSquish) {
            className += ' squish';
        }

        let cards = this.getCards(needsSquish);

        return (
            <div className={ className }
                onDragLeave={ this.onDragLeave }
                onDragOver={ this.onDragOver }
                onDrop={ event => this.onDragDrop(event, 'hand') }>
                <div className='panel-header'>
                    { 'Hand (' + cards.length + ')' }
                </div>
                { cards }
            </div>
        );
    }
}

PlayerHand.displayName = 'PlayerHand';
PlayerHand.propTypes = {
    cardSize: PropTypes.string,
    cards: PropTypes.array,
    isMe: PropTypes.bool,
    onCardClick: PropTypes.func,
    onDragDrop: PropTypes.func,
    onMouseOut: PropTypes.func,
    onMouseOver: PropTypes.func,
    showHand: PropTypes.bool,
    spectating: PropTypes.bool,
    username: PropTypes.string
};

export default PlayerHand;